import assert from 'assert';
import {createHash} from 'crypto';
import * as pgsql from 'pgsql-parser';
import {PgAst, traverse} from './ast';
/**
 * get all tables selected from in a query
 *
 * ```ts
 * tablesQueried("select * from ns.a")
 * // would return
 * [[{name: 'a', schema: 'ns'}]]
 * // and
 * tablesQueried("select * from ns.a; select * from ns.b")
 * // would return
 * [
 *   [{name: 'a', schema: 'ns'}],
 *   [{name: 'b', schema: 'ns'}]
 * ]
 * ```
 * @param query query to analyze
 * @return a list of lists where each outer list corresponds to a single statement.
 */
export function tablesQueried(query: string): Table[][] {
  return toStmts(query).map(s => _tablesQueriedHandleNode(s.node));
}
/**
 * async version of {@link tablesQueried}
 * @param query
 */
export async function tablesQueriedAsync(query: string): Promise<Table[][]> {
  const stmts = await toStmtsAsync(query);
  return stmts.map(s => _tablesQueriedHandleNode(s.node));
}

function _tablesQueriedHandleNode(root: PgAst.AstNodeType): Table[] {
  // get all the ctes first since ctes so they dont get included in the output
  const cteNames = new Set<string>();
  for (let n of traverse(root)) {
    if (n.type === 'CommonTableExpr') {
      assert(n.node.ctename);
      cteNames.add(n.node.ctename);
    }
  }
  const tables = [] as Table[];
  // dont double count tables
  const seen = new Set<string>();
  for (let node of traverse(root)) {
    if (node.type === 'RangeVar') {
      let key = node.node.relname;
      assert(key);
      const t = {name: node.node.relname} as Table;
      if (node.node.schemaname) {
        t.schema = node.node.schemaname;
        key = `${t.schema}.${t.name}`;
        // make sure its not referencing a CTE
      } else if (cteNames.has(t.name)) continue;
      if (!seen.has(key)) tables.push(t);
      seen.add(key);
    }
  }
  return tables;
}

export type Stmt = {
  /**
   * the normalized query
   */
  query: string;
  /**
   * Name of the AST node
   */
  type: keyof PgAst.RawStmt['stmt'];
  /**
   * ast node
   */
  node: PgAst.TraversedNode['node'];
};

type Table = {
  name: string;
  schema?: string;
};

/**
 * break a query up into its normalized statements including the type and ast node
 * @param query query to break into stmts
 */
export function toStmts(query: string): Stmt[] {
  const parsed = pgsql.parse(query);
  return parsed.map(_toStmtHandle);
}
/**
 * async version of {@link toStmts}
 */
export async function toStmtsAsync(query: string): Promise<Stmt[]> {
  const parsed = await pgsql.parseAsync(query);
  return parsed.map(_toStmtHandle);
}

function _toStmtHandle(p: PgAst.Statement): Stmt {
  const rawstmtKeys = Object.keys(
    p.RawStmt.stmt
  ) as (keyof PgAst.RawStmt['stmt'])[];
  const node = p.RawStmt.stmt[rawstmtKeys[0]];
  if (rawstmtKeys.length !== 1 || !node) {
    // should never happen
    throw new Error('Got invalid parser state');
  }
  return {
    type: rawstmtKeys[0],
    query: pgsql.deparse(p),
    node
  };
}
