import { GLSLModules } from '../glsl';
import { linkModule } from './link';
import { addASTSerializer } from '../test/snapshot';

addASTSerializer(expect);

describe("link", () => {
  
  it("links quad vertex", () => {
    
    const code = GLSLModules['instance/quad/vertex'];
    const modules = GLSLModules;
    const linked = linkModule(code, modules);
    expect(linked).toMatchSnapshot();

  });

});