# pg-ast-utils

This package provides some typing and common utilities for working with Postgres
ASTs returned by [pgsql-parser](https://github.com/pyramation/pgsql-parser)--which uses
the real Postgres parser. Transformations leverage the,
`Deparser` provided by [pgsql-parser](https://github.com/pyramation/pgsql-parser)

Install with:

```sh
npm i pg-ast-utils
```

# Usage

## AST

### `traverse`

Takes an AST node returned by `pgsql-parser`'s `parse` func and returns an iterator over
all of its descendants.

```ts
// parse is just a re-exported, typed version of pgsql-parser's parse
import {traverse, parse} from 'pg-ast-utils';
const parsed = parse(`select a,b,c from t`);
// parsed is an array of nodes, traverse accepts a single node
const node = parsed[0];
for (let n of traverse(node)) {
  if (n.type === 'ColumnRef') {
    // n.node type is now inferred by TS
    console.log(n.node.fields[0].String.str);
  }
}
```

outputs:

```
a
b
c
```

Traversing the AST yields objects with the shape
`{type: AstNodeTypeName; node: AstNodeType}`
where `type` is the name of the type of node it is and `node` contains the actual data
within the node. **The typings for the AST nodes are a work in progress and contain
alot of `any` at the moment, but they should include all possible fields in the given
node**. AST typings are defined in the namespace `PgAst` (in `src/ast.ts`).

Objects in the `node` field are references to the AST, so you can modify the AST
by simply writing to the object in `node`.

## Analyze

### `tablesQueried`

Returns all tables queried from (e.g. `insert into a select * from b` would return `b`
but not `a` since `a` is not being queried from.)

```ts
import {tablesQueried} from 'pg-ast-utils';
tablesQueried('select * from ns.a');
// would return
[[{name: 'a', schema: 'ns'}]];
// and
tablesQueried('select * from ns.a join c; select * from ns.b');
// would return
[[{name: 'a', schema: 'ns'}, {name: 'c'}], [{name: 'b', schema: 'ns'}]];
```

## Transform

### `queryCountRows`

Takes a query and generates a new query that returns the row count of the original query.
This is done by moving the root select up into a CTE and then doing `count(*)` on the CTE.

For example:

```ts
queryCountRows(`select * from a`, '_count_col', '_cte');
```

would result in a sql query like:

```sql
with _cte as (select * from a)
select COUNT(*) as _count_col
from _cte
```

and

```ts
queryCountRows(
  `with b as (select * from c) select * from b`,
  '_count_col',
  '_cte'
);
```

would generate this:

```sql
with b as (select * from c),
_cte as (select * from b)
select COUNT(*) as _count_col
from _cte
```

### `addRowCountColumn`

This is like `queryCountRows` but also gives you the actual results of the original query,
simply adding a new column to the result that contains the row count. A common requirement
in an application (for example, a SQL GUI) is to display the first few query results and
show the total number of results, so this allows you to do that in a single query (you would
probably want to paginate with a cursor).

This is done by moving the root select statement up into a CTE and then making
the root SelectStmt select all columns from that CTE and do a COUNT OVER window fn to get the total row count of the CTE that the select statement was moved into.

For example:

```ts
addRowCountColumn(`select * from a`, '_count_col', '_cte');
```

would result in a sql query like:

```sql
with _cte as (select * from a)
select *, COUNT(*) OVER () as _count_col
from _cte
```

and

```ts
addRowCountColumn(
  `with b as (select * from c) select * from b`,
  '_count_col',
  '_cte'
);
```

would generate this:

```sql
with b as (select * from c),
_cte as (select * from b)
select *, COUNT(*) OVER () as _count_col
from _cte
```

### `normalize`

Use the parser to convert a query into a "normalized" form. Could be used for key
generation when caching query results.

```ts
import {normalize} from 'pg-ast-utils';
import {createHash} from 'crypto';
function queryCacheKey(query: string) {
  return `cached-query:${createHash('md5')
    .update(normalize(query))
    .digest('base64')}`;
}
const q1 = 'select a,b,c from table';
const q2 = `SELECT
    a,
    b,
    c
  FROM table;`;
// now equivalent queries with different formatting will produce the same cache key
console.log(queryCacheKey(q1) ==== queryCacheKey(q2));
```

## TODO

- better typing (atm, lots of `any` and `any[]` used in the AST ndoe types)
- common analysis funcs
  - get columns queried
  - get functions used
- transform funcs
  - rewrite tables queried from using a mapping
- run tests in github actions
