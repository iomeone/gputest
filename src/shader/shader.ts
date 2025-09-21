import { Tree, SyntaxNode } from '@lezer/common';

import { parser } from './grammar/glsl';

export const parseGLSL = (code: string): Tree => {
  const parsed = parser.parse(code);
  return parsed;
}
