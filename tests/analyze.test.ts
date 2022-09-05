import assert from 'assert';
import {tablesQueried, tablesQueriedAsync, toStmts, toStmtsAsync} from '../src';
import {stmtTypeExamples} from './data';

describe('analzye fns', () => {
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
  }
});
