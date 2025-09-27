import { $apply } from './patch';
import { refineCursor } from './cursor';

describe('refineCursor', () => {
  
  
  const makeUpdateState = (UPDATE: any = null) => [
    () => UPDATE,
    (update: any) => { UPDATE = update },
  ] as [() => any, (update: any) => void];
  
  it('refines a cursor', () => {

    const state = {
      foo: 1,
      list: [2, 3, 4],
      obj: { hello: 'world' },
    };
    const [getUpdate, updateState] = makeUpdateState();

    const cursor = refineCursor([state, updateState]);

    const [foo, updateFoo] = cursor('foo');
    expect(foo).toEqual(state.foo);
    updateFoo(3);
    expect(getUpdate()).toEqual({ foo: 3 });

    const [hello, updateHello] = cursor('obj', 'hello');
    expect(hello).toEqual(state.obj.hello);

    const $op = (t: string) => t + ' !!!';
    updateHello($apply($op));
    expect(getUpdate()).toEqual({ obj: { hello: { $apply: $op }}});

    const [el, updateEl] = cursor('list', 2);
    expect(el).toEqual(state.list[2]);
    updateEl(3);
    expect(getUpdate()).toEqual({ list: { "2": 3 }});
  });
});

