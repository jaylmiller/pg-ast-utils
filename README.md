# pg-ast-utils

This package provides some typing and common utilities for working with Postgres
ASTs returned by [pgsql-parser](https://github.com/pyramation/pgsql-parser)--which uses
the real Postgres parser.

Install with:

```sh
npm i pg-ast-utils
```

# Usage

## AST

### `traverse`

Returns a generator function iterating over the nodes of an AST.
Takes a node returned by `pgsql-parser`'s `parse` func as input.

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