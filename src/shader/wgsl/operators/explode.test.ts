import { loadModule } from '../shader';
import { bindBundle } from '../bind';
import { linkBundle } from '../link';
import { structType } from './struct';
import { explode } from './explode';

describe('explode', () => {

  it('explodes a struct', () => {

    const type = structType([
      {name: 'foo', format: 'vec2<f32>'},
      {name: 'bar', format: 'u32'},
    ]);

    const storage = `@link struct T;
@export var<storage> source: array<T>;
`;

    const code = `@link fn getFoo(i: u32) -> vec2<f32>;
@link fn getBar(i: u32) -> u32;
fn main() {
  getFoo(0u);
  getBar(0u);
}`;

    const source = bindBundle(loadModule(storage, 'source', 'source'), {T: type});
    const exploded = explode(type, source);

    const main = loadModule(code, 'main');
    const bound = bindBundle(main, {'getFoo:foo': exploded, 'getBar:bar': exploded});

    const recode = linkBundle(bound);
    expect(recode).toMatchSnapshot();
  });

});