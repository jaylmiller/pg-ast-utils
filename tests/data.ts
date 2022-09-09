import {PgAst} from '../src/ast';

// mapping common statements to examples for generating test cases
const _stmtTypeExamples: {
  [K in keyof PgAst.RawStmt['stmt']]: string;
} = {
  SelectStmt: 'select * from a; with cte as (select 1) select * from cte',
  InsertStmt: 'insert into a select 1',
  UpdateStmt: 'update a set b=1',
  CreateStmt: 'create table t (a int primary key, b text)',
  DropStmt: 'drop table a',
  TruncateStmt: 'truncate table a',
  ExplainStmt: 'explain select * from a',
  ViewStmt: 'create view v as select * from a',
  TransactionStmt: 'begin; commit; rollback',
  CreateSchemaStmt: 'create schema if not exists t',
  CreateRoleStmt: 'create role a with superuser login',
  IndexStmt: 'create index ON a(b); create index on a using hash(b)',
  VariableShowStmt: 'SHOW ALL',
  VariableSetStmt: `set SHARED_BUFFERS = '128GB'`,
  CreateFunctionStmt: `
    CREATE OR REPLACE FUNCTION testy()
    RETURNS TABLE (i int)
    LANGUAGE plpgsql
    AS
    $$
    BEGIN
      RETURN QUERY
          SELECT 1;
      END
    $$;
  `
};

export const stmtTypeExamples = Object.entries(_stmtTypeExamples).map(
  ([k, v]) => ({
    type: k as keyof PgAst.RawStmt['stmt'],
    query: v as string
  })
);
