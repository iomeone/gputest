import { patch, $set, $apply, $patch } from './state';

describe('patch', () => {
  
  it('patches primitives', () => {
    const state = {
      s: 'hello',
      n: 1,
      x: 'x',
      foo: {
        a: false,
        b: true,
        c: ['x'],
      },
    };
    const update = {
      s: 'world',
      n: 2,
      foo: {
        a: true,
        c: ['y'],
      },
    };
    expect(patch(state, update)).toMatchSnapshot();
  });

  it('patches with $ops', () => {
    const state = {
      s: 'hello',
      n: 1,
      x: 'x',
      foo: {
        a: false,
        b: true,
        c: ['x'],
      } as any,
    };
    const update = {
      s: $apply((s: string) => s + ' world'),
      x: $patch((x: string) => $set(x + "y")),
      foo: $set({d: true}),
    };
    expect(patch(state, update)).toMatchSnapshot();
  })
  
});