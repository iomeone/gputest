import Modules from './index';

describe('GLSL shader library', () => {
  it('contains modules', () => {
    expect(Modules['fragment/pbr']).toMatch('float');
    expect(Modules['geometry/quad']).toMatch('getQuadUV');
    expect(Modules['use/view']).toMatch('viewMatrix');
  });
});
