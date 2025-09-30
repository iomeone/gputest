import { patch, $apply } from './patch';
import { makeCursor } from './cursor';

describe('cursor', () => {

  const makeUpdateState = (UPDATE: any = null) => [
    () => UPDATE,
    (update: any) => { UPDATE = update },
  ] as [() => any, (update: any) => void];

  it('traverses and resolves', () => {

    const state = {
      foo: 1,
      list: [2, 3, 4],
      obj: { hello: 'world' },
    };
    const [getUpdate, updateState] = makeUpdateState();

    const [cursor] = makeCursor([state, updateState]);

    const [foo, updateFoo] = cursor.foo();
    expect(foo).toEqual(state.foo);
    updateFoo(3);
    expect(getUpdate()).toEqual({ foo: 3 });

    const [hello, updateHello] = cursor.obj.hello();
    expect(hello).toEqual(state.obj.hello);

    const $op = (t: string) => t + ' !!!';
    updateHello($apply($op));
    expect(getUpdate()).toEqual({ obj: { hello: { $apply: $op }}});

    const [el, updateEl] = cursor.list[2]();
    expect(el).toEqual(state.list[2]);
    updateEl(3);
    expect(getUpdate()).toEqual({ list: { "2": 3 }});
  });

  it('caches lookups in same cursor', () => {
    const state = {
      foo: 1,
      list: [2, 3, 4],
      obj: { hello: 'world' },
    };
    const [, updateState] = makeUpdateState();

    const [cursor] = makeCursor([state, updateState]);
    expect(cursor.foo === cursor.foo).toBe(true);
    expect(cursor.obj.hello === cursor.obj.hello).toBe(true);
  });

  it('caches same lookups in different cursor', () => {
    const state = {
      foo: 1,
      list: [2, 3, 4],
      obj: { hello: 'world' },
    };

    const state2 = patch(state, {
      obj: {
        foo: true,
      },
    });

    const state3 = patch(state, {
      obj: {
        hello: 'zzzz',
      },
    });

    const [, updateState] = makeUpdateState();

    const [cursor1, keep1] = makeCursor([state, updateState]);

    cursor1.foo;
    cursor1.list;
    cursor1.obj.foo;
    cursor1.obj.hello;

    const [cursor2, keep2] = makeCursor([state2, updateState], undefined, keep1);

    const [cursor3, ] = makeCursor([state3, updateState], undefined, keep2);

    expect(cursor1.foo === cursor2.foo).toBe(true);
    expect(cursor1.list === cursor2.list).toBe(true);
    expect(cursor1.obj !== cursor2.obj).toBe(true);
    expect(cursor1.obj.hello === cursor2.obj.hello).toBe(true);
    expect(cursor1.obj.foo !== cursor2.obj.foo).toBe(true);
    expect(cursor1.obj.hello === cursor2.obj.hello).toBe(true);
    expect(cursor2.obj.hello !== cursor3.obj.hello).toBe(true);

  });
});

