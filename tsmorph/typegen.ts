// prints types from the gist at https://gist.github.com/beeing/9f7ca576bb344cc772b18c825ec3eab6
import {Project, SyntaxKind, InterfaceDeclaration} from 'ts-morph';

const proj = new Project();
proj.addSourceFileAtPath('./src/ast.ts');
const src = proj.getSourceFiles()[0];
let stmtProps = [] as string[];
const arr = [] as string[];
const nodeTypes = [] as string[];
src.forEachChild(c => {
  if (c.compilerNode.kind === SyntaxKind.ModuleDeclaration) {
    for (let s of c.getDescendantStatements()) {
      if (!(s instanceof InterfaceDeclaration)) continue;
      const n = s.getName();
      arr.push(n);
      if (n.endsWith('Stmt')) {
        stmtProps.push(`${n}?: ${n};`);
      }
      nodeTypes.push(`${n}: ${n}`);
      // nodeTypes.push(`{type: '${n}'; node: ${n}}`);
    }
  }
});
const qs = arr.map(a => `'${a}'`);
// console.log(qs.join(','));
// console.log(qs.join(' | '));
// console.log(stmtProps.join('\n'));
console.log(nodeTypes.join(';'));
