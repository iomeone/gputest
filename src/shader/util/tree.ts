import { SyntaxNode, Tree } from '@lezer/common';

// Gather all child nodes (may be implicit)
export const getChildNodes = (node: SyntaxNode) => {
  const out = [] as SyntaxNode[];
  let n = node.firstChild;
  while (n) {
    out.push(n);
    n = n.nextSibling;
  }
  return out;
}

// Look for error nodes in a tree
export const hasErrorNode = (tree: Tree) => {
  const cursor = tree.cursor();
  do {
    const {type, from, to} = cursor;
    if (type.isError) return cursor.node;
  } while (cursor.next());
  return false;
}

// AST node to tree view + side-by-side tokens
export const formatAST = (node: SyntaxNode, code?: string, depth: number = 0) => {
  const {type, from ,to} = node;
  const prefix = '  '.repeat(depth);

  let child = node.firstChild;
  
  const text = code != null ? code.slice(node.from, node.to).replace(/\n/g, "⮐ ") : '';
  let out = [] as string[];
  
  let line = `${prefix}${type.name}`;
  const n = line.length;
  line += ' '.repeat(60 - n);
  line += text;
  out.push(line);

  while (child) {
    out.push(formatAST(child, code, depth + 1));
    child = child.nextSibling;
  }
  return out.join("\n");
}

// AST node to S-expression
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

// Get depth for each item in a graph, so its dependencies resolve correctly
export const getGraphOrder = (
  graph: Map<string, string[]>,
  name: string,
  depth: number = 0,
) => {
  const queue = [{name, depth: 0}];
  const depths = new Map<string, number>(); 
  while (queue.length) {
    const {name, depth} = queue.shift()!;
    depths.set(name, depth);

    const module = graph.get(name);
    if (!module) continue;

    const deps = module.map(name => ({name, depth: depth + 1}));
    queue.push(...deps);
  }
  return depths;
}

