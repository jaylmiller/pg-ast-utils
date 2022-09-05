import assert from 'assert';
import {
  normalize,
  normalizeAsync,
  addRowCountColumn,
  queryCountRows
} from '../src';

const testCases = [
  {
    query: 'select 1',
    name: 'Simple query no CTEs',
    queryCountRowsExpected: `
        with _cte_name as (select 1) 
        select 
          count(*) as _testy_col
        FROM _cte_name
        `,
    addRowCountColExpected: `
        with _cte_name as (select 1) 
        select 
          *,
          count(*) OVER () AS _testy_col
        FROM _cte_name
      `
  },
  {
    query: `
      WITH a AS (SELECT asdf
        FROM t NATURAL JOIN b),
      a1 AS (SELECT 12)
      SELECT a.*, a1.*, 99
      FROM a
              JOIN b ON a.asdf = b.id
      `,
    name: 'with clause multiple CTEs',
    queryCountRowsExpected: `
    WITH a AS (SELECT asdf
      FROM t NATURAL JOIN b),
    a1 AS (SELECT 12),
    _cte_name as (
      SELECT a.*, a1.*, 99
      FROM a
              JOIN b ON a.asdf = b.id
    )
    select 
      count(*) AS _testy_col
    FROM _cte_name
    
    `,
    addRowCountColExpected: `
      WITH a AS (SELECT asdf
        FROM t NATURAL JOIN b),
      a1 AS (SELECT 12),
      _cte_name as (
        SELECT a.*, a1.*, 99
        FROM a
                JOIN b ON a.asdf = b.id
      )
      select 
        *,
        count(*) OVER () AS _testy_col
        
      FROM _cte_name
      `
  },
  {
    query: `
      WITH a AS (SELECT asdf
        FROM t NATURAL JOIN b),
      a1 AS (SELECT 12)
      SELECT a.asdf
      FROM a
              JOIN b ON a.asdf = b.id
      group by a.asdf
      having count(*) > 1
      `,
    name: 'multiple CTEs and having clause in base query',
    queryCountRowsExpected: `
    WITH a AS (SELECT asdf
      FROM t NATURAL JOIN b),
    a1 AS (SELECT 12),
    _cte_name as (
      SELECT a.asdf
      FROM a
              JOIN b ON a.asdf = b.id
      group by a.asdf
      having count(*) > 1
    )
    select 
      count(*) AS _testy_col
    FROM _cte_name
    `,
    addRowCountColExpected: `
      WITH a AS (SELECT asdf
        FROM t NATURAL JOIN b),
      a1 AS (SELECT 12),
      _cte_name as (
        SELECT a.asdf
        FROM a
                JOIN b ON a.asdf = b.id
        group by a.asdf
        having count(*) > 1
      )
      select 
        *,
        count(*) OVER () AS _testy_col
      FROM _cte_name
      `
  },
  {
    query: `select * from a order by b limit 5`,
    name: `root select has order and limit`,
    queryCountRowsExpected: `
    with _cte_name as (select * from a order by b limit 5)
    select 
      count(*) AS _testy_col
    FROM _cte_name
   `,
    addRowCountColExpected: `
        with _cte_name as (select * from a order by b limit 5)
        select 
          *,
          count(*) OVER () AS _testy_col
        FROM _cte_name
       `
  }
];

const addedCol = '_testy_col';
const cteName = '_cte_name';
describe('transform functions', () => {
  describe('queryCountRows', () => {
    testCases.forEach(c => {
      it(c.name, () => {
        const res = queryCountRows(c.query, addedCol, cteName);
        assert.equal(res, normalize(c.queryCountRowsExpected));
        return;
      });
    });
  });
  describe('addRowCountColumn', () => {
    testCases.forEach(c => {
      it(c.name, async () => {
        const res = addRowCountColumn(c.query, addedCol, cteName);
        assert.equal(res, normalize(c.addRowCountColExpected));
        return;
      });
    });
  });

  for (let testAsync of [false, true]) {
    describe(`normalize${testAsync ? 'Sync' : ''}`, () => {
      [
        {
          q1: 'SelEct * from a JOIN b On a.id = b.id',
          q2: 'select * from a join b on a.id = b.id',
          name: 'casing differences'
        },
        {
          q1: `
      select *
      from a
      `,
          q2: ` select *
  
      from a`,
          name: 'handles spacing differences'
        },
        {
          q1: `
  select * from
  -- comment
  a join b 
  -- c2
  on a.id = b.id`,
          q2: 'select * from a join b on a.id = b.id',
          name: 'handles comments'
        },
        {
          q1: `
      select generate_Series(0, 100)
      `,
          q2: ` select generate_Series (0, 100)`,
          name: 'handles functions'
        },
        {
          q1: `
      create TabLe testy (a int,
        b int
        )
      `,
          q2: `create table testy (a int, B int)`,
          name: 'handles DDL'
        },
        {
          q1: `select 1; 
      select 2; 
      select 3;`,
          q2: 'select 1; select 2; select 3;',
          name: 'handles multi-statement queries'
        }
      ].forEach(c => {
        it(c.name, async () => {
          const fn = testAsync ? normalizeAsync : normalize;
          const q1 = await fn(c.q1);
          const q2 = await fn(c.q2);
          assert.equal(q1, q2);
        });
      });
    });
  }
});
