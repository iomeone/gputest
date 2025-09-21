import { parser } from './grammar/glsl';
import { formatAST, formatASTNode } from './ast';

export const parseGLSL = (code: string) => {
  const parsed = parser.parse(code);
  console.log(parsed);
  return parsed;
}