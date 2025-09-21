import { SyntaxNode } from '@lezer/common';

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
