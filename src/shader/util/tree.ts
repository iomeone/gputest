import { SyntaxNode, Tree } from '@lezer/common';
import { CompressedNode } from '../types';

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


// Decompress a compressed AST on the fly by returning a pseudo-tree-cursor.
export const decompressAST = (nodes: CompressedNode[]) => {
  const tree = {
    __nodes: () => nodes,
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

      const lastChild = () => {
        const {to} = self;
        do {
          const node = nodes[i + 1];
          if (node && node[1] >= to) return false;
        } while (next());
        return false;
      }

      const self = {
        type: {name: ''},
        node: {parent: {type: {name: 'Program'}}},
        from: 0,
        to: 0,
        next,
        lastChild,
      } as any;

      next();

      return self;
    },
  } as any as Tree;
  return tree;
}
