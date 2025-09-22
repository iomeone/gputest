import { GLSLModules } from '../glsl';
import { linkModule } from './link';
import { addASTSerializer } from '../test/snapshot';

addASTSerializer(expect);

describe("link", () => {
  
  it("links an external", () => {
    
    const code = `
    vec4 getColor();
    void main() {
      vec4 v;
      v.xyz = vec3(1.0, 0.0, 0.0);
      gl_FragColor = getColor();
    }
    `
    
    const getColor = `
    #pragma export
    vec4 getColor() { return vec4(1.0, 0.0, 1.0, 1.0); }
    `
    
    const linked = linkModule(code, {}, {getColor});
    expect(linked).toMatchSnapshot();

  });

  it("links quad vertex", () => {

    const getPosition = `
    #pragma export
    vec4 getPosition(int index) { return vec4(1.0, 0.0, 1.0, 1.0); }
    `

    const getSize = `
    #pragma export
    float getSize(int index) { return 1.0; }
    `
    
    const code = GLSLModules['instance/quad/vertex'];
    const modules = GLSLModules;
    const linked = linkModule(code, modules, {getPosition, getSize});
    expect(linked).toMatchSnapshot();

  });
  
});