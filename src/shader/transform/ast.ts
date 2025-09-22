import { SyntaxNode, Tree } from '@lezer/common';
import {
  CompressedNode,
  SymbolTable,
  SymbolRef,
  ModuleRef,
  ImportRef,
  PrototypeRef,
  FunctionRef,
  DeclarationRef,
  VariableRef,
  LocalRef,
  TypeRef,
  StructRef,
  MemberRef,
  QualifiedStructRef,
} from '../types';
import * as T from '../grammar/glsl.terms';
import { GLSL_NATIVE_TYPES, HASH_KEY } from '../constants';
import siphash from "../siphash13";

const unescape = (s: string) => s.slice(1, -1).replace(/\\(.)/g, '$1');

function nodeToString(this: SyntaxNode) { return `[${this.type.name}]`; }

export const getProgramHash = (code: string) => {
  const uint = siphash.hash_uint(HASH_KEY, code);
  return uint.toString(36).slice(-10);
}

export const hasErrorNode = (tree: Tree) => {
  const cursor = tree.cursor();
  do {
    const {type, from, to} = cursor;
    if (type.isError) return cursor.node;
  } while (cursor.next());
  return false;
}

export const getChildNodes = (node: SyntaxNode) => {
  const out = [] as SyntaxNode[];
  let n = node.firstChild;
  while (n) {
    // @ts-ignore
    n.__proto__.toJSON = nodeToString;
    out.push(n);
    n = n.nextSibling;
  }

  return out;
}

export const formatASTNode = (node: SyntaxNode) => {
  const {type} = node;
  let child = node.firstChild;
  let inner = [] as string[];
  while (child) {
    inner.push(formatASTNode(child));
    child = child.nextSibling;
  }
  const space = inner.length ? ' ' : '';
  return `(${type.name}${space}${inner.join(" ")})`;
}

export const formatAST = (node: SyntaxNode, program?: string, depth: number = 0) => {
  const {type, from ,to} = node;
  const prefix = '  '.repeat(depth);

  let child = node.firstChild;
  
  const text = program != null ? program.slice(node.from, node.to).replace(/\n/g, "⮐ ") : '';
  let out = [] as string[];
  
  let line = `${prefix}${type.name}`;
  const n = line.length;
  line += ' '.repeat(60 - n);
  line += text;
  out.push(line);

  while (child) {
    out.push(formatAST(child, program, depth + 1));
    child = child.nextSibling;
  }
  return out.join("\n");
}

export const makeASTParser = (code: string, tree: Tree) => {
  const throwError = (t: string, n?: SyntaxNode) => {
    if (!n) throw new Error(`Missing node`);
    console.log(formatAST(tree.topNode, code));
    throw new Error(`Error parsing ${t} node '${code.slice(n.from, n.to)}'\n${formatAST(n, code)}`);
  }

  const getNodes = (node: SyntaxNode, min?: number) => {
    const nodes = getChildNodes(node);
    for (const n of nodes) if (node.type.isError) throwError('error', node);
    if (min != null && nodes.length < min) throwError(`not enough nodes (${min})`, node);
    return nodes;
  }

  const getText = (node: SyntaxNode) => {
    if (!node) throwError('text');
    return code.slice(node.from, node.to);
  }
  
  const getQualifier = getText;
  
  const getQualifiedType = (node: SyntaxNode): TypeRef => {
    const [a, b] = getNodes(node);

    const qualifiers = b ? getNodes(a).map(getQualifier) : [];
    const def = b ?? a;

    const {name, members} = getTypeSpecifier(def);
    if (members) return {name, qualifiers, members};

    return {name, qualifiers};
  }
  
  const getTypeSpecifier = (node: SyntaxNode): TypeRef => {
    if (node.type.id === T.Identifier) {
      const name = getText(node);
      return {name};
    }
    if (node.type.id === T.TypeSpecifier) {
      const [def] = getNodes(node, 1);
      if (def.type.id === T.Struct) {
        const {name, members} = getStructType(def);
        return {name, members};
      }
      else {
        const name = getText(def);
        return {name};
      }
    }
    
    throw throwError('type specifier', node);
  }

  const getStructType = (node: SyntaxNode): TypeRef => {
    const [, b, c] = getNodes(node, 3);
    const name = getText(b);
    const {members} = getStructMembers(c);
    return {name, members};
  }

  const getArrayName = (node: SyntaxNode): string => {
    const [a] = getNodes(node, 1);
    return getText(a);
  }

  const getLocal = (node: SyntaxNode): LocalRef => {
    const [a, b] = getNodes(node, 1);
    const name = getArrayName(a);
    const expr = b ? getText(b) : null;
    return {name, expr};
  }

  const getMember = (node: SyntaxNode): MemberRef => {
    const [a, b] = getNodes(node, 2);
    const type = getTypeSpecifier(a);
    const name = getArrayName(b);
    return {name, type};
  }

  const getStructMembers = (node: SyntaxNode): StructRef => {
    const nodes = getNodes(node);
    const members = nodes.map(getMember);
    return {members};
  }

  const getImport = (node: SyntaxNode): ImportRef => {
    const [a, b] = getNodes(node, 1);
    const hasAlias = !!b;

    const imported = getText(a);
    const name = hasAlias ? getText(b) : imported;

    return {name, imported};
  };

  const getPrototype = (node: SyntaxNode): PrototypeRef => {
    const [a, b, c] = getNodes(node, 2);

    const type = getQualifiedType(a);
    const name = getText(b);
    const parameters = c ? getNodes(c).map(getText) : [];
    const symbols = [{name}];

    return {name, type, parameters};
  };
  
  const getVariable = (node: SyntaxNode): VariableRef => {
    const [a, ...rest] = getNodes(node, 1);
    const type = getQualifiedType(a);
    const locals = rest.map(getLocal);

    return {type, locals};
  }
  
  const getQualifiedStruct = (node: SyntaxNode): QualifiedStructRef => {
    const [a, b, c, d] = getNodes(node, 3);
    
    const type = getQualifiedType(node);
    const name = getText(d ?? b);
    const struct = getStructMembers(c);

    return {name, type, struct};
  }
  
  const getFunction = (node: SyntaxNode): FunctionRef => {
    const [a] = getNodes(node, 1);
    const exported = isExported(node);
    const prototype = getPrototype(a);
    const symbols = [prototype.name];

    return {prototype, symbols, exported};
  };

  const getDeclaration = (node: SyntaxNode): DeclarationRef => {
    const [a] = getNodes(node);
    const exported = isExported(node);

    if (a.type.id === T.FunctionPrototype) {
      const prototype = getPrototype(a);
      const {name} = prototype;
      const symbols = [name];
      return {symbols, prototype, exported};
    }
    if (a.type.id === T.VariableDeclaration) {
      const variable = getVariable(a);
      const symbols = variable.locals.map(({name}) => name);

      const {type} = variable;
      if (!GLSL_NATIVE_TYPES.has(type.name)) symbols.push(type.name);

      return {symbols, variable, exported};
    }
    if (a.type.id === T.QualifiedStructDeclaration) {
      const struct = getQualifiedStruct(a);
      const {name, type} = struct;

      const symbols = [name];
      if (type.name === name) {
        // Struct is anonymous, members are global
        for (const {name, type} of struct.struct.members) {
          symbols.push(name);
          if (!GLSL_NATIVE_TYPES.has(type.name)) symbols.push(type.name);
        }
      }
      else if (
        !GLSL_NATIVE_TYPES.has(type.name)
      ) {
        // Custom type
        symbols.push(type.name);
      }

      return {symbols, struct, exported};
    }
    if (a.type.id === T.QualifiedDeclaration) {
      // TODO: are members global symbols?
      return {symbols: [], exported};
    }
    
    throw throwError('declaration', node);
  };

  const isExported = (node: SyntaxNode): boolean => {  
    const pragma = node.prevSibling;

    if (!pragma || pragma.type.id !== T.Preprocessor) return false;

    const [a, b] = getNodes(pragma, 2);
    const directive = getText(a);
    if (directive !== 'pragma') return false;

    const verb = getText(b);
    return verb === 'export';
  };

  const extractImports = (): ModuleRef[] => {
    const modules: Record<string, ImportRef[]> = {};

    const children = tree.topNode.getChildren(T.Preprocessor);
    for (const child of children) {
      const [a, b, c, d] = getNodes(child);    
      const directive = getText(a);
      if (directive !== 'pragma') continue;

      const verb = getText(b);
      if (verb !== 'import') continue;

      let module: string;
      let refs: ImportRef[];
      if (c.type.id === T.String) {
        refs = [];
        module = unescape(getText(c));
      } 
      else {
        refs = getNodes(c).map(getImport);
        module = unescape(getText(d));
      }

      let items = modules[module];
      if (!items) items = modules[module] = [];
    
      items.push(...refs);
    }

    const out = [] as ModuleRef[];
    for (const k in modules) out.push({
      name: k,
      symbols: modules[k].map(({name}) => name),
      imports: modules[k],
    });
    return out;
  }

  const extractFunctions = (): FunctionRef[] => {
    const children = tree.topNode.getChildren(T.FunctionDefinition);
    return children.map(getFunction);
  }

  const extractDeclarations = (): DeclarationRef[] => {
    const children = tree.topNode.getChildren(T.Declaration);
    return children.map(getDeclaration);
  };

  const extractSymbolTable = (): SymbolTable => {
    const hash = getProgramHash(code);

    const modules = extractImports();
    const functions = extractFunctions();
    const declarations = extractDeclarations();

    const externals = declarations
      .filter(d => d.prototype)
      .filter(d => !functions.find(f => f.prototype.name === d.prototype!.name));

    const refs = [...modules, ...functions, ...declarations];
    const exported = [...functions, ...declarations].filter(d => d.exported);
    
    const visibles = exported.flatMap(r => r.symbols);
    const symbols = refs.flatMap(r => r.symbols);

    return {hash, refs, symbols, visibles, externals, modules, functions, declarations};
  }
  
  return {extractImports, extractFunctions, extractDeclarations, extractSymbolTable};
}

export const rewriteUsingAST = (code: string, tree: Tree, rename: Map<string, string>) => {
  let out = '';
  let pos = 0;

  const skip = (from: number, to: number, replace?: string) => {
    out = out + code.slice(pos, from);
    pos = to;

    if (replace != null) out = out + replace;
  }

  const cursor = tree.cursor();
  do {
    const {type, from, to} = cursor;
    if (type.name === 'skip') {
      skip(from, to, '');
    }
    else if (type.name === 'version') {
      cursor.parent();
      cursor.parent();
      const {from, to} = cursor;
      skip(from, to, '');
      cursor.lastChild();
    }
    else if (type.name === 'import' || type.name === 'export') {
      cursor.parent();
      const {from, to} = cursor;
      skip(from, to, '');
      cursor.lastChild();
    }
    else if (type.name === 'Field') {
      const sub = cursor.node.cursor;
      do {} while (sub.firstChild());

      const name = code.slice(sub.from, sub.to);
      const replace = rename.get(name);

      if (replace) skip(sub.from, sub.to, replace);
      cursor.lastChild();
    }
    else if (type.name === 'Identifier') {
      const name = code.slice(from, to);
      const replace = rename.get(name);

      if (replace) skip(from, to, replace);      
    }
  } while (cursor.next());

  const n = code.length;
  skip(n, n);

  return out;
}

export const compressAST = (tree: Tree): CompressedNode[] => {
  const out = [] as any[]

  const skip = (from: number, to: number) => out.push(["skip", from, to]);
  const ident = (from: number, to: number) => out.push(["Identifier", from, to]);

  const cursor = tree.cursor();
  do {
    const {type, from, to} = cursor;
    if (type.name === 'version') {
      cursor.parent();
      cursor.parent();
      const {from, to} = cursor;
      skip(from, to);
      cursor.lastChild();
    }
    if (type.name === 'import' || type.name === 'export') {
      cursor.parent();
      const {from, to} = cursor;
      skip(from, to);
      cursor.lastChild();
    }
    else if (type.name === 'Field') {
      const sub = cursor.node.cursor;
      do {} while (sub.firstChild());
      ident(sub.from, sub.to);
      cursor.lastChild();
    }
    else if (type.id === T.Identifier) {
      const {from, to} = cursor;
      ident(from, to);
    }
  } while (cursor.next());

  return out;
}

export const decompressAST = (nodes: CompressedNode[]) => {
  const tree = {
    cursor: () => {
      let i = -1;
      const n = nodes.length;
      const next = () => {
        const hasNext = ++i < n;
        if (!hasNext) return false;
        
        const node = nodes[i];
        [self.type.name, self.from, self.to] = node;

        return true;
      };
        
      const self = {
        type: {name: ''},
        from: 0,
        to: 0,
        next,
      } as any;

      next();

      return self;
    },
  } as any as Tree;
  return tree;
}
