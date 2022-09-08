from collections import Counter, OrderedDict
from dataclasses import dataclass
import os
from typing import Optional
import httpx
import re

found = re.findall(r'/\*.*?\*/', 'AlterTableCmd\t/* one subcommand of an ALTER TABLE */')
CmdType = "CmdType"
Oid = "Oid"


def get_struct_lines(fname: str, sourcelink: str):
    if not os.path.exists(fname):
        with open(fname, 'wt') as f:
            res = httpx.get(sourcelink)
            f.write(res.text)
    structs = {}
    with open(fname) as f:
        lines = f.readlines()
        lines = [l.strip() for l in lines]
        lines = [l for l in lines if not l.startswith('*') and not l.startswith('/*')]
        for idx, l in enumerate(lines):
            if l.startswith('typedef struct'):
                name = l.replace('typedef struct', '')
                for c in re.findall(r'/\*.*?\*/', l):
                    name = name.replace(c, '')
                name = name.strip()
                endline = next(i for i,l in enumerate(lines[idx+1:]) if  "} " + name in l) + idx
                structlines = [l.strip() for l in lines[idx+1: endline+1]]
                structs[name] =  [ll for ll in structlines if ll != '{']
    return structs

@dataclass
class _parseditem:
    tname: str
    prop: str
    handled: bool

# hardcode value nodes
values = {
    t: [_parseditem("number", "ival", True),_parseditem("string", "str", True) ] 
    for t in ["String", "Integer", "Float", "Null", "BitString"]
}

parenttype = "AllAstNodes"
nodetype = "AstNode"
def parseitem(s, lines) -> list[_parseditem]:
    tdef = f"\t{s}: "+ "{\n"
    ps = []
    for field in lines:
        for c in re.findall(r'/\*.*?\*/', field):
            field = field.replace(c, '')
        if "/*" in field:
            field = field[:field.index("/*")]
        tokens = field.split()
        if len(tokens) == 0:
            continue
        if tokens[0] == "struct":
            tokens = tokens[1:]    
        if len(tokens) != 2:
            continue
        tname,prop = tokens
        h = True
        if tname == "NodeTag":
            continue
        prop = prop.replace('*', '').replace(';', '')
        if tname == "Node":
            tname = nodetype
        elif tname == "List":
            tname = f"{nodetype}[]"
        elif tname == "bool":
            tname = "boolean"
        elif tname.startswith("int") or tname == "long":
            tname = "number"
        elif tname == "char":
            tname = "string"
        elif tname == "Oid":
            tname = "number"
        elif tname == CmdType:
            tname = "string"
        else:
            h = False
        text = f"\t\t{prop}: {tname};\n"
        tdef += text
        ps.append(_parseditem(tname, prop, h))
    return ps



def main():
    structs = get_struct_lines("nodes.h", "https://raw.githubusercontent.com/postgres/postgres/REL_13_STABLE/src/include/nodes/parsenodes.h")
    prims = get_struct_lines("primnodes.h", "https://raw.githubusercontent.com/postgres/postgres/REL_13_STABLE/src/include/nodes/primnodes.h")
    primitems = OrderedDict()
    for s,lines in prims.items():
        parsed = parseitem(s, lines)
        if len(parsed) > 0:
            primitems[s] = parsed
    
    # structs = {k:v for k,v in structs.items() if k in ['CreateSchemaStmt', 'SelectStmt']}
    nodes = OrderedDict()
    
    for s,lines in structs.items():
        if s == "Query":
            continue
        nodes[s] = parseitem(s, lines)
    nodes.update(**values)
    primstodec = OrderedDict()
    for k,v in nodes.items():
        for p in v:
            p: _parseditem
            if not p.handled:
                if p.tname in nodes:
                    p.handled = True
                    p.tname = f"{parenttype}['{p.tname}']"
                elif p.tname in primitems:
                    print(p.tname)
                    p.handled = True
                    primstodec[p.tname] = primitems[p.tname]
                    p.tname = f"{parenttype}['{p.tname}']"
                else:
                    # todo figure these out
                    print(p.tname)
                    p.tname = "any"
    for k,v in primstodec.items():
        for p in v:
            p: _parseditem
            if not p.handled:
                if p.tname in nodes:
                    raise ValueError
                elif p.tname in primitems:
                    p.handled = True
                    primstodec[p.tname] = primitems[p.tname]
                    p.tname = f"{parenttype}['{p.tname}']"
                else:
                    # todo figure these out
                    print(p.tname)
                    p.tname = "any"
    typestring = f"interface {parenttype} " + "{\n"
    stmts = {k:v for k,v in nodes.items() if k.endswith('Stmt')}
    literalarray = []
    for k,v in stmts.items():
        typestring += "\t" + k + ": {\n"
        vv: _parseditem
        for vv in v:
            typestring += f"\t\t{vv.prop}?: {vv.tname};\n"
        typestring += "\t}\n"
        literalarray.append(k)
    for k,v in nodes.items():
        if k in stmts:
            continue
        typestring += "\t" + k + ": {\n"
        vv: _parseditem
        for vv in v:
            typestring += f"\t\t{vv.prop}?: {vv.tname};\n"
        typestring += "\t}\n"
        literalarray.append(k)
    for k,v in primstodec.items():
        typestring += "\t"+ k + ": {\n"
        vv: _parseditem
        for vv in v:
            typestring += f"\t\t{vv.prop}?: {vv.tname};\n"
        typestring += "\t}\n"
        literalarray.append(k)
    typestring += "}"
    lstring = "[\n" + ",\n".join([f"'{l}'" for l in literalarray ]) + "\n]"
    with open("typedef.txt", "wt" ) as f:
        f.write(typestring)
    with open("typeliteralarray.txt", "wt" ) as f:
        f.write(lstring)
    print(typestring)
    print(lstring)
    return
            
    

if __name__ == '__main__':
    main()
