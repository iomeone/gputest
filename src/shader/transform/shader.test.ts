import { GLSLModules } from '../glsl';
import { parseGLSL } from './shader';
import { makeASTParser } from './ast';
import { formatAST, formatASTNode } from './ast';
import { addASTSerializer } from '../test/snapshot';

addASTSerializer(expect);

describe('shader', () => {
  
  it('parses', () => {
    const code = GLSLModules['instance/quad/vertex'];
    const tree = parseGLSL(code);
    expect(tree).toBeTruthy();
  });
  
});
