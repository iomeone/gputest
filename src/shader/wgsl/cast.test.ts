import { loadModule } from './shader';
import { linkBundle } from './link';
import { castTo } from './cast';

describe('cast', () => {
  
  it('casts', () => {
    
    const code = `
     @export fn getValue() -> vec2<f32> { return vec2<f32>(1.0, 2.0); }
    `;

    const mod = loadModule(code, 'code', 'getValue');
    const result = castTo(mod, 'vec3<f32>', 'xyx');
    
    const recode = linkBundle(result);
    expect(recode).toMatchSnapshot();

  });

  it('casts complex swizzle', () => {
    
    const code = `
     @export fn getValue() -> vec2<f32> { return vec2<f32>(1.0, 2.0); }
    `;

    const mod = loadModule(code, 'code', 'getValue');
    const result = castTo(mod, 'vec4<f32>', {
      basis: 'xy10',
      signs: '-+-+',
      gain: 2,
    });
    
    const recode = linkBundle(result);
    expect(recode).toMatchSnapshot();

  });
  
  it('casts and links', () => {
    
    const code = `
    @export fn getValue() -> vec2<f32> { return vec2<f32>(1.0, 2.0); }
    `;

    const main = `
    @external fn getValue() -> vec3<f32> {};
    fn main() { getValue(); }
    `;

    const sub = loadModule(code, 'code', 'getValue');
    const mod = loadModule(main, 'main');
    const getValue = castTo(sub, 'vec3<f32>', 'xyx');

    const recode = linkBundle(mod, {getValue});
    expect(recode).toMatchSnapshot();

  });

});