declare module 'pgsql-parser' {
  type Statement = import('./src/ast').PgAst.Statement;
  export function parse(query: string): Statement[];
  export function parseAsync(query: string): Promise<Statement[]>;
  export function deparse(ast: Statement | Statement[]): string;
}
