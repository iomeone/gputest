import { GLSLModules } from '@use-gpu/glsl';
import { parseGLSL } from './shader';
import { makeASTParser } from './ast';
import { formatAST, formatASTNode } from './ast';

describe('shader', () => {
  
  it('parses', () => {
    const code = GLSLModules['instance/quad/vertex'];
    const tree = parseGLSL(code);
    expect(tree).toBeTruthy();
  })
  
  it('extracts imports', () => {
    const code = GLSLModules['instance/quad/vertex'];

    const tree = parseGLSL(code);
    const {extractImports} = makeASTParser(code, tree);

    const imports = extractImports();
    expect(imports["use/types"][0]).toEqual(expect.objectContaining({"name":"MeshVertex","imported":"MeshVertex"}));
  });
  
  it('extracts functions', () => {
    const code = GLSLModules['instance/quad/vertex'];

    const tree = parseGLSL(code);
    const {extractFunctions} = makeASTParser(code, tree);

    const functions = extractFunctions();
    expect(functions[0]).toEqual(expect.objectContaining({
      name: 'main',
      parameters: [],
      type: 'void',
    }));
  });
  
});