import assert from 'assert';
import {randomBytes} from 'crypto';
import * as pgsql from 'pgsql-parser';
import {createNode, PgAst} from './ast';

/**
 * Transform select statement(s) into query that returns the total number of rows in
 * that the initial query returns. This is done by pushing the inital query up into
 * a CTE and then doing a `select count(*)` from it
 * @param query
 * @param _cteName
 */
export function rowCountQuery(query: string, _cteName = '__cte__') {
  const transformed = pgsql.parse(query).map(p => {
    // added column will be deleted
    const newQuery = _rowCountHandleNode(p, `__delete`, _cteName);
  });
}

/**
 * Transform select statement(s) by adding to its result an additional column
 * that contains the total number of rows that the query returned. This is done by
 * moving the root node SelectStmt into a CTE and then making the root SelectStmt select
 * all columns from that CTE and do a COUNT OVER window fn to get the total row count of
 * that CTE.
 *
 * For example:
 * ```ts
 * addRowCountColumn(`select * from a`, '_count_col', '_cte')
 * ```
 * would result in a sql query like:
 * ```sql
 * with _cte as (select * from a)
 * select *, COUNT(*) OVER () as _count_col
 * from _cte
 * ```
 *  and
 * ```ts
 * addRowCountColumn(`with b as (select * from c) select * from b`, '_count_col', '_cte')
 * ```
 * would generate:
 * ```sql
 * with b as (select * from c),
 * _cte as (select * from b)
 * select *, COUNT(*) OVER () as _count_col
 * from _cte
 * ```
 *
 * @param query String containg the select statement(s) to transform.
 *  If multiple statements are in the query, each one must be a select.
 * @param addedColName The name of the added column that contains the row count
 * @param _cteName The name of the CTE to add to the query, this won't effect the result
 *  of the transformed query, so its optional
 * @returns return sql query containing the transformed statement(s)
 */
export function addRowCountColumn(
  query: string,
  addedColName: string,
  _cteName = '__cte__'
): string {
  const parsed = pgsql.parse(query);
  return pgsql.deparse(
    parsed.map(p => _rowCountHandleNode(p, addedColName, _cteName))
  );
}

// handle signle node for addRowCountColumn func
function _rowCountHandleNode(
  node: PgAst.Statement,
  addedColName: string,
  _cteName: string
) {
  // only selects
  const select = node.RawStmt.stmt.SelectStmt;
  if (!select) throw new Error('only accepts select statements');
  // create copy of the original query with CTEs removed (will move the base query
  // into a CTE that comes after the CTEs defined in the initial statement, so it
  // will still have references to those CTEs in the resulting query)
  const origQuery: PgAst.TypeToAstNode<'SelectStmt'> = JSON.parse(
    JSON.stringify(node.RawStmt.stmt)
  );
  delete origQuery.SelectStmt.withClause;

  // node representing a selection column of `COUNT(*) OVER () as {addedColName}`
  const countOverNode = createNode('ResTarget', {
    name: addedColName,
    val: createNode('FuncCall', {
      funcname: [createNode('String', {str: 'count'})],
      agg_star: true,
      over: createNode('WindowDef', {
        frameOptions: 1058
      })
    })
  });
  // selection targets for new query
  const newTargets = [
    createNode('ResTarget', {
      val: createNode('ColumnRef', {fields: [createNode('A_Star', {})]})
    }),
    countOverNode
  ];
  // all the CTEs in the new query... this will include existing ctes and then
  // the new one we create for the existing select
  const ctesForNewQuery = [] as PgAst.TypeToAstNode<'CommonTableExpr'>[];
  if (select.withClause) {
    // add existing ctes to the new query
    const withClause = select.withClause;
    assert(
      Array.isArray(withClause.ctes) && withClause.ctes.length,
      'Expected to find CTEs in withClause'
    );
    for (let cte of withClause.ctes) {
      assert(
        cte.CommonTableExpr,
        `expected to get node type CommonTableExpr (got type=${PgAst.getNodeType(
          cte
        )})`
      );
      ctesForNewQuery.push(cte);
    }
  }
  // create a CTE from original base query
  ctesForNewQuery.push(
    createNode('CommonTableExpr', {
      ctename: _cteName,
      ctequery: origQuery
    })
  );
  node.RawStmt.stmt = createNode('SelectStmt', {
    // todo: Recursive ctes
    withClause: {ctes: ctesForNewQuery, recursive: false},
    targetList: newTargets,
    op: 'SETOP_NONE',
    fromClause: [
      // from clause is simply the last cte we created (using the original base query)
      createNode('RangeVar', {
        relname: _cteName,
        inh: true,
        relpersistence: 'p'
      })
    ]
  });
  return node;
}

function _moveRootSelectToCTE(node: PgAst.Statement) {
  const select = node.RawStmt.stmt.SelectStmt;
  if (!select) throw new Error('only accepts select statements');
}

/**
 * create a "normalized" (consistent casing, comments) version of a query
 * for example, a normalized query could be used to generate a cache key for a query cache
 * @param query query to normalize
 * @return the normalized query
 */
export function normalize(query: string): string {
  return pgsql.deparse(pgsql.parse(query));
}
/**
 * async version of {@link normalize}
 */
export async function normalizeAsync(query: string): Promise<string> {
  return pgsql.deparse(await pgsql.parseAsync(query));
}
