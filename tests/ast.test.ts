import assert from 'assert';
import * as pgsql from 'pgsql-parser';
import {normalize} from '../src';
import {PgAst, traverse} from '../src/ast';
import {stmtTypeExamples} from './data';
describe('pgsql-parser and ast interact as expected', () => {
  it('traverse yields valid nodes', () => {
    const q = `select a,b,c from 
      (select d, e, f from tab) subquery
    `;
    const parsed = pgsql.parse(q);
    for (let n of traverse(parsed[0].RawStmt)) {
      console.log(n);
      assert(PgAst.isNodeType(n.type));
    }
  });
  it('traverse iterates over every node and in expected order', () => {
    const q = `select a,b,c from 
      (select d, e, f from tab) subquery
    `;
    const parsed = pgsql.parse(q);
    const columnsRefd = [] as string[];
    for (let n of traverse(parsed[0].RawStmt)) {
      if (n.type === 'ColumnRef') {
        assert(n.node.fields.length === 1);
        const col = n.node.fields[0].String.str;
        assert(col);
        columnsRefd.push(col);
      }
    }
    assert.equal(columnsRefd.length, 6);
    assert.deepEqual(columnsRefd, ['a', 'b', 'c', 'd', 'e', 'f']);
  });
  it('modify nodes traversing', () => {
    const q = `select a,b,c from 
      (select d, e, f from tab) subquery
    `;
    const parsed = pgsql.parse(q);
    for (let n of traverse(parsed[0].RawStmt)) {
      if (n.type === 'ColumnRef') {
        const col = n.node.fields[0].String.str;
        if (col === 'a') {
          n.node.fields[0].String.str = 'z';
        }
      }
    }
    const newquery = pgsql.deparse(parsed);
    assert.equal(
      newquery,
      normalize(`select z,b,c from 
        (select d, e, f from tab) subquery
      `)
    );
  });
  it('parse returns array of nodes', () => {
    const asts = pgsql.parse('select 1');
    assert(Array.isArray(asts));
    assert(asts[0].RawStmt);
    assert(asts[0].RawStmt.stmt);
    const asts2 = pgsql.parse('select 1; select 2; select 3;');
    assert.equal(asts2.length, 3);
  });
  it('deparse takes stmts', () => {
    const asts = pgsql.parse('select 1; select 2; select 3;');
    const deparsed = pgsql.deparse(asts);
    assert(typeof deparsed === 'string');
  });
  it('deparse takes single stmt', () => {
    const asts = pgsql.parse('select 1; select 2; select 3;');
    const deparsed = pgsql.deparse(asts[0]);
    assert(typeof deparsed === 'string');
  });

  for (let eg of stmtTypeExamples) {
    const {type, query} = eg;
    it(`parses statement type: ${type}`, () => {
      const parsed = pgsql.parse(query);
      parsed.forEach(p => {
        assert(p.RawStmt.stmt[type]);
      });
    });
  }
});
