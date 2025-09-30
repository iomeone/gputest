import { loadModule } from '../shader';
import { bindBundle } from '../bind';
import { linkBundle } from '../link';
import { instanceWith } from './instanced';

describe('instanced', () => {

  it('loads two instanced values', () => {

    const value1 = `
    @export fn getValue1(i: u32) -> vec4<f32> { return vec4<f32>(1.0, 2.0, 3.0, 4.0); }
    `;
    const value2 = `
    @export fn getValue2(i: u32) -> vec2<u32> { return vec2<u32>(1u, 2u); }
    `;

    const index = `
    @export fn getIndex(i: u32) -> u32 { return i * 2u + 1u; }
    `;

    const code = `
    @link fn loadIndex(i: u32);
    fn main(i: u32) -> vec4<f32> {
      let loaded = loadIndex(i);
    }
    `;

    const sub1 = loadModule(value1, 'value1', 'getValue1');
    const sub2 = loadModule(value2, 'value2', 'getValue2');
    const ind  = loadModule(index, 'index', 'getIndex');

    const main = loadModule(code, 'main');

    const loadIndex = instanceWith([sub1, sub2], ind);
    const bound = bindBundle(main, {loadIndex});

    const recode = linkBundle(bound);
    expect(recode).toMatchSnapshot();

  });

});