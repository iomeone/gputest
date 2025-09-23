import { GLSLModules } from '@use-gpu/glsl';
import { linkCode, linkModule } from './link';
import { loadModule } from './shader';
import { formatAST } from '../util/tree'; 
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
  
  it("tree shakes around identifiers", () => {

    const sub = `
    float used() { return 1.0; }

    float unused() { return 1.0; }
    
    #pragma export
    vec4 getPosition(int index) { return vec4(used(), 0.0, 1.0, 1.0); }

    #pragma export
    vec4 getColor(int index) { return vec4(used(), 0.0, 1.0, 1.0); }
    `

    const main = `
    vec4 getPosition(int index);
    void main() {
      vec4 a = getPosition(0);
    }
    `

    {
      const modMain = loadModule(main, 'main', undefined, false);
      const modSub = loadModule(sub, 'sub', undefined, false);

      const getPosition = {...modSub, entry: 'getPosition'};
      const getColor = {...modSub, entry: 'getColor'};

      const linked = linkModule(modMain, {}, {getPosition, getColor});
      expect(linked).toMatchSnapshot();
    }

    {
      const modMain = loadModule(main, 'main', undefined, true);
      const modSub = loadModule(sub, 'sub', undefined, true);

      const getPosition = {...modSub, entry: 'getPosition'};
      const getColor = {...modSub, entry: 'getColor'};

      const linked = linkModule(modMain, {}, {getPosition, getColor});
      expect(linked).toMatchSnapshot();
    }

  });
  
  it("links same module twice with different entry point", () => {

    const sub = `
    float used() { return 1.0; }
    
    #pragma export
    vec4 getPosition(int index) { return vec4(used(), 0.0, 1.0, 1.0); }

    #pragma export
    vec4 getColor(int index) { return vec4(used(), 0.0, 1.0, 1.0); }
    `

    const main = `
    vec4 getPosition(int index);
    vec4 getColor(int index);
    void main() {
      vec4 a = getPosition(0);
      vec4 b = getColor(0);
    }
    `

    const modMain = loadModule(main, 'main', undefined, false);
    const modSub = loadModule(sub, 'sub', undefined, false);

    const getPosition = {...modSub, entry: 'getPosition'};
    const getColor = {...modSub, entry: 'getColor'};

    const linked = linkModule(modMain, {}, {getPosition, getColor});
    expect(linked).toMatchSnapshot();

  });

  it("links a global across a module", () => {

    const sub1 = `
    #pragma global
    #pragma export
    vec4 getPosition(int index) { return vec4(1.0, 0.0, 1.0, 1.0); }
    `

    const sub2 = `
    void getPosition() {};
    
    #pragma export
    vec4 getColor(int index) {
      getPosition();
      return vec4(1.0, 0.0, 1.0, 1.0);
    }
    `

    const main = `
    vec4 getPosition(int index);
    vec4 getColor(int index);
    void main() {
      vec4 a = getPosition(0);
    }
    `

    const modMain = loadModule(main, 'main');
    const modSub1 = loadModule(sub1, 'sub1');
    const modSub2 = loadModule(sub2, 'sub2');

    const getPosition = {...modSub1, entry: 'getPosition'};
    const getColor = {...modSub2, entry: 'getColor'};

    const linked = linkModule(modMain, {}, {getPosition, getColor});
    expect(linked).toMatchSnapshot();

    expect(linked).toMatch(/vec4 getPosition/);
    expect(linked).not.toMatch(/vec4 _[A-Za-z0-9]{2,}_getPosition/);

    expect(linked).not.toMatch(/void getPosition/);
    expect(linked).toMatch(/void _[A-Za-z0-9]{2,}_getPosition/);

  });
});
