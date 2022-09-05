import assert from 'assert';
import {normalize, normalizeAsync} from '../src';
describe('transform functions', () => {
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
