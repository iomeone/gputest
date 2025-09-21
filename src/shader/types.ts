import { Tree, SyntaxNode } from '@lezer/common';

export type ImportRef {
  node: SyntaxNode,
  name: string,
  imported: string,
}

export type FunctionRef {
  node: SyntaxNode,
  type: string,
  name: string,
  parameters: string[],
}