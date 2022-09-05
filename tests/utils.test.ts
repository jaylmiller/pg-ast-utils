import assert from 'assert';
import {
  normalize,
  normalizeAsync,
  tablesQueried,
  tablesQueriedAsync,
  toStmts,
  toStmtsAsync
} from '../src';
import {stmtTypeExamples} from './data';

for (let testAsync of [false, true]) {
  describe(`tablesQueried${testAsync ? 'Async' : ''}`, () => {
    [
      {
        q: 'select * from a',
        expected: [[{name: 'a'}]],
        name: 'basic query single table no schema'
      },
      {
        q: 'select * from ns.a',
        expected: [[{name: 'a', schema: 'ns'}]],
        name: 'basic single query table w/ schema'
      },
      {
        q: `with cte as (select c1, c2, c3 from acte)
          select * from cte join b on cte.c1 = b.c`,
        expected: [[{name: 'acte'}, {name: 'b'}]],
        name: 'query with CTE and join'
      },
      {
        q: `with cte as (select c1, c2, c3 from acte),
          cte2 as (select c1 from acte)
          select * from cte join b on cte.c1 = b.c`,
        expected: [[{name: 'acte'}, {name: 'b'}]],
        name: 'query with multiple CTEs referencing same table'
      },
      {
        q: `insert into a select * from b`,
        expected: [[{name: 'b'}]],
        name: 'in insert stmts, gets table being selected from for insert'
      }
    ].forEach(c => {
      it(c.name, async () => {
        const f = testAsync ? tablesQueriedAsync : tablesQueried;
        const tables = await f(c.q);
        // order doesnt matter
        const tableObjSorter = (t1: {name: string}, t2: {name: string}) =>
          t1.name.localeCompare(t2.name);
        assert.deepEqual(
          tables[0].sort(tableObjSorter),
          c.expected[0].sort(tableObjSorter)
        );
      });
    });
  });
  describe(`toStmts${testAsync ? 'Sync' : ''}`, () => {
    for (let eg of stmtTypeExamples) {
      const {type, query} = eg;
      it(`${type}`, async () => {
        const fn = testAsync ? toStmtsAsync : toStmts;
        const stmts = await fn(query);
        stmts.forEach(s => {
          assert.equal(s.type, type);
        });
      });
    }
  });
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
