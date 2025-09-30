import { transpileWGSL } from './shader';
import { WGSLModules } from './wgsl.test.data.ts';

describe('shader', () => {

  it('transpiles wgsl to ES', () => {

    const source = WGSLModules['getQuadVertex'];
    const resourcePath = '/getQuadVertex';

    const {output: normal} = transpileWGSL(source, resourcePath, { esModule: true, minify: false });
    const {output: minified} = transpileWGSL(source, resourcePath, { esModule: true, minify: true });

    expect(normal).toMatchSnapshot();
    expect(minified).toMatchSnapshot();

  });

  it('transpiles wgsl to CJS', () => {

    const source = WGSLModules['getQuadVertex'];
    const resourcePath = '/getQuadVertex';

    const {output: normal} = transpileWGSL(source, resourcePath, { esModule: false, minify: false });
    const {output: minified} = transpileWGSL(source, resourcePath, { esModule: false, minify: true });

    expect(normal).toMatchSnapshot();
    expect(minified).toMatchSnapshot();

  });

  it('transpiles wgsl to ES with types', () => {

    const source = WGSLModules['getQuadVertex'];
    const resourcePath = '/getQuadVertex';

    const {output: normal} = transpileWGSL(source, resourcePath, { esModule: true, minify: false, types: true });
    const {output: minified} = transpileWGSL(source, resourcePath, { esModule: true, minify: true, types: true });

    expect(normal).toMatchSnapshot();
    expect(minified).toMatchSnapshot();

  });

});