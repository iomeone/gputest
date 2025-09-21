import { SyntaxNode, Tree } from '@lezer/common';
import { ImportRef, FunctionRef } from './types';
import * as T from './grammar/glsl.terms';

const unescape = (s: string) => s.slice(1, -1).replace(/\\(.)/g, '$1');
const parseError = (t: string, s: string, n: SyntaxNode) => {
  throw new Error(`Error parsing ${t} node '${s.slice(n.from, n.to)}' ${formatASTNode(n)}`);
}

export const getNodes = (node: SyntaxNode) => {
  const out = [] as SyntaxNode[];
  let n = node.firstChild;
  while (n) {
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

export const formatAST = (node: SyntaxNode, program: string, depth: number = 0) => {
  const {type, from ,to} = node;
  const prefix = '  '.repeat(depth);

  let child = node.firstChild;
  
  const text = program.slice(node.from, node.to).replace(/\n/g, "⮐ ")
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
  const getText = (node: SyntaxNode) => code.slice(node.from, node.to);

  const getImport = (node: SyntaxNode) => {
    const [a, b] = getNodes(node);
    if (!a) throw parseError('import', code, node);

    const hasAlias = !!b;

    const imported = getText(a);
    const name = hasAlias ? getText(b) : imported;

    return {node, name, imported};
  };

  const getFunction = (node: SyntaxNode) => {
    const [prototype] = getNodes(node);
    const [a, b, c] = getNodes(prototype);
    if (!a || !b) throw parseError('function', code, node);

    const type = getText(a);
    const name = getText(b);
    const parameters = c ? getNodes(c).map(getText) : [];

    return {node, type, name, parameters};
  };

  const extractImports = () => {
    const imports: Record<string, ImportRef[]> = {};

    const children = tree.topNode.getChildren(T.Preprocessor);
    for (const child of children) {

      const [a, b, c] = getNodes(child);    
      if (!a) continue;

      const verb = getText(a);
      if (verb === 'import') {
        const refs = getNodes(b).map(getImport);
        const module = unescape(getText(c));
      
        let items = imports[module];
        if (!items) items = imports[module] = [];
      
        items.push(...refs);
      }

    }

    return imports;
  }

  const extractFunctions = () => {
    const functions: FunctionRef[] = [];

    const children = tree.topNode.getChildren(T.FunctionDefinition);
    for (const child of children) {
      functions.push(getFunction(child));
    }

    return functions;
  }

  return {extractImports, extractFunctions};
}

