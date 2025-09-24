//import { GLSLModules } from '@use-gpu/glsl';
import { parseShader } from './shader';
import { makeASTParser /*, rewriteUsingAST, resolveShakeOps, compressAST, decompressAST*/ } from './ast';
import { formatAST, hasErrorNode } from '../util/tree';
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

  it('gets test imports', () => {
    const code = `
    import {MeshVertex} from 'use/types';
    import {viewUniforms as view, worldToClip} from 'use/view';
    import {getQuadUV} from 'geometry/quad';

    import 'test';

    @optional @external fn getInt() -> i32 {}

    @export fn main() {}
    `;

    const tree = parseShader(code);
    const {getImports} = makeGuardedParser(code, tree);

    const imports = getImports();
    expect(imports).toMatchSnapshot();
  });

  it('gets test var/const declarations', () => {
    const code = `
      var x: f32;
      var y: f32;
      let a: i32 = 3;
      type integer = i32;
      override b: i32;
    `;

    const tree = parseShader(code);
    const {getDeclarations} = makeGuardedParser(code, tree);

    const declarations = getDeclarations();
    expect(declarations).toMatchSnapshot();
  });

  it('gets test empty function declaration', () => {
    const code = `
      @export fn main() {}
    `;

    const tree = parseShader(code);
    const {getDeclarations} = makeGuardedParser(code, tree);

    const declarations = getDeclarations();
    expect(declarations).toMatchSnapshot();
  });

  it('gets test function declaration', () => {
    const code = `
      @stage(fragment) fn fragShader(in1: A, @location(2) in2: f32) -> @location(0) vec4<f32> {
        return foo(in1, in2);
      }
    `;

    const tree = parseShader(code);
    const {getDeclarations} = makeGuardedParser(code, tree);

    const declarations = getDeclarations();
    expect(declarations).toMatchSnapshot();
  });

  it('gets test struct declaration', () => {
    const code = `
      struct light {
        intensity: f32;
        @annotate position: vec3<f32>;
      }
    `;

    const tree = parseShader(code);
    const {getDeclarations} = makeGuardedParser(code, tree);

    const declarations = getDeclarations();
    expect(declarations).toMatchSnapshot();
  });

  it('gets test declarations with array', () => {
    const code = `
      let QUAD: array<vec2<i32>, 4> = array<vec2<i32>, 4>(
        vec2<i32>(0, 0),
        vec2<i32>(1, 0),
        vec2<i32>(0, 1),
        vec2<i32>(1, 1),
      );
    `;

    const tree = parseShader(code);
    const {getDeclarations} = makeGuardedParser(code, tree);

    const declarations = getDeclarations();
    expect(declarations).toMatchSnapshot();
  });

  it('gets symbol table', () => {
    const code = `
      @exported var x: f32;
      var y: f32;
      let a: i32 = 3;
      type integer = i32;
      override b: i32;

      @exported struct light {
        intensity: f32;
        @annotate position: vec3<f32>;
      }

      let QUAD: array<vec2<i32>, 4> = array<vec2<i32>, 4>(
        vec2<i32>(0, 0),
        vec2<i32>(1, 0),
        vec2<i32>(0, 1),
        vec2<i32>(1, 1),
      );

      @optional @external fn getInt() -> i32 {}

      @export fn main() {}
    `;

    const tree = parseShader(code);
    const {getSymbolTable} = makeGuardedParser(code, tree);

    const table = getSymbolTable();
    expect(table).toMatchSnapshot();
  });

  it('gets shake table', () => {
    const code = `
      @exported var x: f32;
      var y: f32;

      @optional @external fn getFloat1() -> f32 {}

      @optional @external fn getFloat2() -> f32 { return x + y; }

      @export fn main() {
        var z: f32 = getFloat1() + getFloat2();
      }
    `;

    const tree = parseShader(code);
    const {getShakeTable} = makeGuardedParser(code, tree);

    const table = getShakeTable();
    expect(table).toMatchSnapshot();
  });

  /*
  it('gets quad vertex imports', () => {
    const code = GLSLModules['instance/vertex/quad'];

    const tree = parseShader(code);
    const {getImports} = makeGuardedParser(code, tree);

    const imports = getImports();
    expect(imports).toMatchSnapshot();
  });
  
  it('gets quad vertex functions', () => {
    const code = GLSLModules['instance/vertex/quad'];

    const tree = parseShader(code);
    const {getFunctions} = makeGuardedParser(code, tree);

    const functions = getFunctions();
    expect(functions).toMatchSnapshot();
  });

  it('gets quad vertex declarations', () => {
    const code = GLSLModules['instance/vertex/quad'];

    const tree = parseShader(code);
    const {getDeclarations} = makeGuardedParser(code, tree);

    const declarations = getDeclarations();
    expect(declarations).toMatchSnapshot();
  });

  it('gets solid fragment declarations', () => {
    const code = GLSLModules['instance/fragment/solid'];

    const tree = parseShader(code);
    const {getDeclarations} = makeGuardedParser(code, tree);

    const declarations = getDeclarations();
    expect(declarations).toMatchSnapshot();
  });

  it('gets use view declarations', () => {
    const code = GLSLModules['use/view'];

    const tree = parseShader(code);
    const {getDeclarations} = makeGuardedParser(code, tree);

    const declarations = getDeclarations();
    expect(declarations).toMatchSnapshot();
  });

  it('gets quad vertex symbol table', () => {
    const code = GLSLModules['instance/vertex/quad'];

    const tree = parseShader(code);
    const {getSymbolTable} = makeGuardedParser(code, tree);

    const symbolTable = getSymbolTable();
    expect(symbolTable).toMatchSnapshot();
  });

  it('gets geometry quad symbol table', () => {
    const code = GLSLModules['geometry/quad'];

    const tree = parseShader(code);
    const {getSymbolTable} = makeGuardedParser(code, tree);

    const symbolTable = getSymbolTable();
    expect(symbolTable).toMatchSnapshot();
  });

  it('gets use view symbol table', () => {
    const code = GLSLModules['use/view'];

    const tree = parseShader(code);
    const {getSymbolTable} = makeGuardedParser(code, tree);

    const symbolTable = getSymbolTable();
    expect(symbolTable).toMatchSnapshot();
  });

  it('gets use types symbol table', () => {
    const code = GLSLModules['use/types'];

    const tree = parseShader(code);
    const {getSymbolTable} = makeGuardedParser(code, tree);

    const symbolTable = getSymbolTable();
    expect(symbolTable).toMatchSnapshot();
  });

  it('rewrites code using the AST', () => {
    const code = `
    float getValue(int index);
    void main() {
      float x = 3.0;
      float y = getValue(2);
    }
    `;

    const tree = parseShader(code);
    const rename = new Map<string, string>();
    rename.set('main', 'entryPoint');
    rename.set('getValue', '_zz_getValue');
    
    const output = rewriteUsingAST(code, tree, rename);
    expect(output).toMatchSnapshot();
  });

  it('rewrites code using the compressed AST', () => {
    const code = `
    float getValue(int index);
    void main() {
      float x = 3.0;
      float y = getValue(2);
      vec3 v;
      v.xyz;
    }
    `;

    const tree = parseShader(code);
    const rename = new Map<string, string>();
    rename.set('main', 'entryPoint');
    rename.set('getValue', '_zz_getValue');
    
    const compressed = compressAST(tree);
    const decompressed = decompressAST(compressed);
    expect(compressed).toMatchSnapshot();
    expect(decompressed).toMatchSnapshot();

    const output1 = rewriteUsingAST(code, tree, rename);
    const output2 = rewriteUsingAST(code, decompressed, rename);
    expect(output2).toEqual(output1);
  });

  it('rewrites a lot of code using the compressed AST', () => {
    const code = `
#pragma import {SolidVertex} from 'use/types'

SolidVertex getVertex(int, int);

#ifdef IS_PICKING
layout(location = 0) out flat uint fragIndex;
#else
layout(location = 0) out vec4 fragColor;
layout(location = 1) out vec2 fragUV;
#endif

void main() {
  int vertexIndex = gl_VertexIndex;
  int instanceIndex = gl_InstanceIndex;

  SolidVertex v = getVertex(vertexIndex, instanceIndex);

  gl_Position = v.position;
#ifdef IS_PICKING
  fragIndex = uint(instanceIndex);
#else
  fragColor = v.color;
  fragUV = v.uv;
#endif
}
    `;

    const tree = parseShader(code);
    const rename = new Map<string, string>();
    rename.set('main', 'entryPoint');
    rename.set('getVertex', '_zz_getVertex');
    
    const compressed = compressAST(tree);
    const decompressed = decompressAST(compressed);
    expect(compressed).toMatchSnapshot();
    expect(decompressed).toMatchSnapshot();

    const output1 = rewriteUsingAST(code, tree, rename);
    const output2 = rewriteUsingAST(code, decompressed, rename);
    expect(output2).toEqual(output1);
  });

  it('recompresses AST', () => {
    const code = `
#pragma import {SolidVertex} from 'use/types'

SolidVertex getVertex(int, int);

#ifdef IS_PICKING
layout(location = 0) out flat uint fragIndex;
#else
layout(location = 0) out vec4 fragColor;
layout(location = 1) out vec2 fragUV;
#endif

void main() {
  int vertexIndex = gl_VertexIndex;
  int instanceIndex = gl_InstanceIndex;

  SolidVertex v = getVertex(vertexIndex, instanceIndex);

  gl_Position = v.position;
#ifdef IS_PICKING
  fragIndex = uint(instanceIndex);
#else
  fragColor = v.color;
  fragUV = v.uv;
#endif
}
    `;

    const tree = parseShader(code);
    const compressed = compressAST(tree);
    const decompressed = decompressAST(compressed);
    const recompressed = compressAST(decompressed);
    expect(compressed).toEqual(recompressed);
  });

  it('shakes simple program', () => {
    const code = `
const float x = 1.0;

#pragma export
float getA() {
  return x;
}

#pragma export
float getB() {
  return x;
}
    `;

    const tree = parseShader(code);
    const table = makeGuardedParser(code, tree).getShakeTable();

    expect(table).toBeTruthy();
    expect(table).toMatchSnapshot();
    if (!table) return;
    
    const keep = new Set(['getA']);
    const ops = resolveShakeOps(table, keep);
    expect(rewriteUsingAST(code, tree, new Map(), ops)).toMatchSnapshot();
  });
  
  it('shakes use/view AST', () => {
    const code = GLSLModules['use/view'];

    const tree = parseShader(code);
    const table = makeGuardedParser(code, tree).getShakeTable();

    expect(table).toBeTruthy();
    expect(table).toMatchSnapshot();
    if (!table) return;
    
    const keep = new Set(['worldToClip']);
    const ops = resolveShakeOps(table, keep);
    expect(rewriteUsingAST(code, tree, new Map(), ops)).toMatchSnapshot();
  });

  it('shakes use/view AST using compressed AST', () => {
    const code = GLSLModules['use/view'];

    const tree = parseShader(code);
    const table = makeGuardedParser(code, tree).getShakeTable();

    expect(table).toBeTruthy();
    expect(table).toMatchSnapshot();
    if (!table) return;
    
    const keep = new Set(['worldToClip']);
    const ops = resolveShakeOps(table, keep);
    
    const tree1 = tree;
    const tree2 = decompressAST(compressAST(tree1));

    const code1 = rewriteUsingAST(code, tree1, new Map(), ops);
    const code2 = rewriteUsingAST(code, tree2, new Map(), ops);

    expect(code2).toEqual(code1);
  });

  it('gets shake information for instance/vertex/quad AST', () => {
    const code = GLSLModules['instance/vertex/quad'];

    const tree = parseShader(code);
    const table = makeGuardedParser(code, tree).getShakeTable();
    expect(table).toMatchSnapshot();
    
  });

  it('gets shake information for geometry/quad AST', () => {
    const code = GLSLModules['geometry/quad'];

    const tree = parseShader(code);
    const table = makeGuardedParser(code, tree).getShakeTable();
    expect(table).toMatchSnapshot();
    
  });

  it('gets shake information for use/types AST', () => {
    const code = GLSLModules['use/types'];

    const tree = parseShader(code);
    const table = makeGuardedParser(code, tree).getShakeTable();
    expect(table).toMatchSnapshot();
    
  });
  */
});

