import { loadModule } from '../shader';
import { bindBundle } from '../bind';
import { linkBundle } from '../link';
import { structType } from './struct';

describe('struct', () => {

  it('makes a struct', () => {

    const type = structType([
      {name: 'foo', format: 'vec2<f32>'},
      {name: 'bar', format: 'u32'},
    ]);

    const code = `@link struct T;
fn main() -> T { };
`;

    const main = loadModule(code, 'main');
    const bound = bindBundle(main, {T: type});

    const recode = linkBundle(bound);
    expect(recode).toMatchSnapshot();
  });

});