import { GLSLModules } from '../glsl';
import { parseGLSL } from './shader';
import { makeASTParser, formatAST, hasErrorNode } from './ast';
import { addASTSerializer } from '../test/snapshot';

addASTSerializer(expect);

describe('ast', () => {
  
  const makeGuardedParser = (code: any, tree: any): ReturnType<typeof makeASTParser> => {
    let errorNode = hasErrorNode(tree);
    if (errorNode) {
      for (let i = 0; i < 2; ++i) if (errorNode.parent) errorNode = errorNode.parent;
      console.log(formatAST(errorNode, code));
      throw new Error("Error in AST");
    }
    
    return makeASTParser(code, tree);
  }

  it('extracts test declarations', () => {
    const code = `
      float x, y;
      int a = 3, b = 1, c, d;
    `;

    const tree = parseGLSL(code);
    const {extractDeclarations} = makeGuardedParser(code, tree);

    const declarations = extractDeclarations();
    expect(declarations).toMatchSnapshot();
  });
  
  it('extracts test declarations with array', () => {
    const code = `
      const ivec2 QUAD[] = {
        ivec2(0, 0),
        ivec2(1, 0),
        ivec2(0, 1),
        ivec2(1, 1),
      };
    `;

    const tree = parseGLSL(code);
    const {extractDeclarations} = makeGuardedParser(code, tree);

    const declarations = extractDeclarations();
    expect(declarations).toMatchSnapshot();
  });
  
  it('extracts quad vertex imports', () => {
    const code = GLSLModules['instance/quad/vertex'];

    const tree = parseGLSL(code);
    const {extractImports} = makeGuardedParser(code, tree);

    const imports = extractImports();
    expect(imports).toMatchSnapshot();
  });
  
  it('extracts quad vertex functions', () => {
    const code = GLSLModules['instance/quad/vertex'];

    const tree = parseGLSL(code);
    const {extractFunctions} = makeGuardedParser(code, tree);

    const functions = extractFunctions();
    expect(functions).toMatchSnapshot();
  });

  it('extracts quad vertex declarations', () => {
    const code = GLSLModules['instance/quad/vertex'];

    const tree = parseGLSL(code);
    const {extractDeclarations} = makeGuardedParser(code, tree);

    const declarations = extractDeclarations();
    expect(declarations).toMatchSnapshot();
  });

  it('extracts quad fragment declarations', () => {
    const code = GLSLModules['instance/quad/fragment'];

    const tree = parseGLSL(code);
    const {extractDeclarations} = makeGuardedParser(code, tree);

    const declarations = extractDeclarations();
    expect(declarations).toMatchSnapshot();
  });

  it('extracts use view declarations', () => {
    const code = GLSLModules['use/view'];

    const tree = parseGLSL(code);
    const {extractDeclarations} = makeGuardedParser(code, tree);

    const declarations = extractDeclarations();
    expect(declarations).toMatchSnapshot();
  });

  it('extracts quad vertex symbol table', () => {
    const code = GLSLModules['instance/quad/vertex'];

    const tree = parseGLSL(code);
    const {extractSymbolTable} = makeGuardedParser(code, tree);

    const symbolTable = extractSymbolTable();
    expect(symbolTable).toMatchSnapshot();
  });

  it('extracts geometry quad symbol table', () => {
    const code = GLSLModules['geometry/quad'];

    const tree = parseGLSL(code);
    const {extractSymbolTable} = makeGuardedParser(code, tree);

    const symbolTable = extractSymbolTable();
    expect(symbolTable).toMatchSnapshot();
  });

  it('extracts use view symbol table', () => {
    const code = GLSLModules['use/view'];

    const tree = parseGLSL(code);
    const {extractSymbolTable} = makeGuardedParser(code, tree);

    const symbolTable = extractSymbolTable();
    expect(symbolTable).toMatchSnapshot();
  });

  it('extracts use types symbol table', () => {
    const code = GLSLModules['use/types'];

    const tree = parseGLSL(code);
    const {extractSymbolTable} = makeGuardedParser(code, tree);

    const symbolTable = extractSymbolTable();
    expect(symbolTable).toMatchSnapshot();
  });
});
