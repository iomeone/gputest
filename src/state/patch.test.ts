import { patch, diff, revise, $set, $apply, $patch, $delete, getUpdateKeys } from './patch';

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
  
  it('diffs values', () => {
    const state = {
      s: 'hello',
      n: [1],
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
      n: [2],
    };
    const nextState = patch(state, update);

    expect(diff(state, nextState)).toMatchSnapshot();
  });

  it('revises diffs', () => {
    const state = {
      s: 'hello',
      n: [1],
      x: 'x',
      d: true,
      foo: {
        a: false,
        b: true,
        c: ['x'],
      } as any,
      bar: {
        obj: {
          baz: true,
        },
      } as any,
      list: [{foo: false}, {bar: false}],
    };
    const update = {
      d: $delete(),
      s: $apply((s: string) => s + ' world'),
      x: $patch((x: string) => $set(x + "y")),
      foo: $apply((foo: any) => ({...foo, a: true, b: false})),
      bar: { obj: { baz: false }},
      n: [2],
      list: {0: {foo: true}},
    };
    const reverse = revise(state, update);

    expect(reverse).toMatchSnapshot();
  });

  it('gets update keys', () => {
    const update = {
      d: $delete(),
      s: $apply((s: string) => s + ' world'),
      x: $patch((x: string) => $set(x + "y")),
      foo: $apply((foo: any) => ({...foo, a: true, b: false})),
      bar: { obj: { baz: false }},
      n: [2],
      list: {0: {foo: true}},
    };
    
    const keys = getUpdateKeys(update);
    expect(keys).toMatchSnapshot();
  });
});