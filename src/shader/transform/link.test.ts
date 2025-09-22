import { GLSLModules } from '@use-gpu/glsl';
import { linkCode } from './link';
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
    
    const linked = linkCode(code, {}, {getColor});
    expect(linked).toMatchSnapshot();

  });

  it("links quad vertex", () => {

    const getPosition = `
    #pragma export
    vec4 getPosition(int index) { return vec4(1.0, 0.0, 1.0, 1.0); }
    `

    const getColor = `
    #pragma export
    vec4 getColor(int index) { return vec4(1.0, 0.0, 1.0, 1.0); }
    `

    const getSize = `
    #pragma export
    float getSize(int index) { return 1.0; }
    `

    const code = GLSLModules['instance/vertex/quad'];
    const modules = GLSLModules;
    const linked = linkCode(code, modules, {getPosition, getColor, getSize});
    expect(linked).toMatchSnapshot();

  });
  
  it("lifts recursive dependency", () => {
    
    const code = `
    #pragma import {getLifted} from 'getLifted'
    #pragma import {getColor1} from 'getColor1'
    void main() {
      gl_FragColor = getColor1();
    }
    `

    const getLifted = `
    // Lifted Code
    #pragma export
    void getLifted() {}
    `

    const getColor1 = `
    #pragma import {getColor2} from 'getColor2'
    #pragma export
    vec4 getColor1() { return getColor2(); }
    `
    
    const getColor2 = `
    #pragma import {getLifted} from 'getLifted'
    #pragma export
    vec4 getColor2() { return vec4(1.0, 0.0, 1.0, 1.0); }
    `
    
    const linked = linkCode(code, {getColor1, getColor2, getLifted});
    expect(linked.indexOf('// Lifted Code')).toBeLessThan(linked.indexOf('getColor2'));
    expect(linked).toMatchSnapshot();

  });
  
});