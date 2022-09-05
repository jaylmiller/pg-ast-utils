"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// prints types from the gist at https://gist.github.com/beeing/9f7ca576bb344cc772b18c825ec3eab6
const ts_morph_1 = require("ts-morph");
const proj = new ts_morph_1.Project();
proj.addSourceFileAtPath('./src/ast.ts');
const src = proj.getSourceFiles()[0];
let stmtProps = [];
const arr = [];
const nodeTypes = [];
src.forEachChild(c => {
    if (c.compilerNode.kind === ts_morph_1.SyntaxKind.ModuleDeclaration) {
        for (let s of c.getDescendantStatements()) {
            if (!(s instanceof ts_morph_1.InterfaceDeclaration))
                continue;
            const n = s.getName();
            arr.push(n);
            if (n.endsWith('Stmt')) {
                stmtProps.push(`${n}?: ${n};`);
            }
            nodeTypes.push(`{type: '${n}'; node: ${n}}`);
        }
    }
});
const qs = arr.map(a => `'${a}'`);
// console.log(qs.join(','));
// console.log(qs.join(' | '));
// console.log(stmtProps.join('\n'));
console.log(nodeTypes.join(' | '));
//# sourceMappingURL=typegen.js.map