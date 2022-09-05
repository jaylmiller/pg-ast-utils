import * as pgsql from 'pgsql-parser';
import {traverse, PgAst} from './ast';
export function addRowCountColumn(query: string, newColName: string) {}

// handle signle node for addRowCountColumn func
function _rowCountHandleNode(node: PgAst.Statement) {
  // only selects
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
