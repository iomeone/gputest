import { LiveFiber, LiveComponent, LiveFunction, DeferredCall } from './types';

import { bind } from './fiber';
import { use, provide, makeContext } from './builtin';
import { makeHostFiber, renderSync } from './tree';
import { useCallback, useContext, useMemo, useOne, useResource, useState, memoArgs, memoProps } from './hooks';

type NullReturner = () => null;
type NumberReturner = () => number;
type FunctionReturner = () => () => any;
type PropNumberReturner = (x: number) => number;

it('memoizes a function', () => {

  const F: LiveFunction<PropNumberReturner> = memoArgs((x: number): number => {
    return Math.random();
  });

  {
    const result1 = bind(F)(1);
    const result2 = bind(F)(1);

    expect(result1).not.toBe(result2);
  }

  {
    const bound = bind(F);

    const result1 = bound(1);
    const result2 = bound(1);
    const result3 = bound(2);

    expect(result2).toBe(result1);
    expect(result3).not.toBe(result2);
  }
})

it('memoizes a component', () => {

  // @ts-ignore
  const F: LiveFunction<NumberReturner> = memoProps((props): number => {
    return Math.random();
  });

  {
    const bound = bind(F);
    const result1 = bound({foo: 1, bar: 1});
    const result2 = bound({foo: 1, bar: 2});

    expect(result1).not.toBe(result2);
  }

  {
    const bound = bind(F);
    const result1 = bound({foo: 1, bar: 1});
    const result2 = bound({foo: 1, bar: 1});

    expect(result1).toBe(result2);
  }
})

it('holds state (hook)', () => {

  const F: NumberReturner = (): number => {
    const [foo] = useState(() => Math.random());
    return foo;
  };

  {
    const result1 = bind(F)();
    const result2 = bind(F)();

    expect(result1).not.toBe(result2);
  }

  {
    const bound = bind(F);
    const result1 = bound();
    const result2 = bound();

    expect(result1).toBe(result2);
  }
})

it('holds memoized value (hook)', () => {

  const dep = 'static';

  const F: NumberReturner = (): number => {

    const foo = useMemo(() => Math.random(), [dep]);

    return foo;
  };

  {
    const result1 = bind(F)();
    const result2 = bind(F)();

    expect(result1).not.toBe(result2);
  }

  {
    const bound = bind(F);
    const result1 = bound();
    const result2 = bound();

    expect(result1).toBe(result2);
  }
})

it('holds memoized value with one dep (hook)', () => {

  const dep = 'static';

  const F: NumberReturner = (): number => {

    const foo = useOne(() => Math.random(), dep);

    return foo;
  };

  {
    const result1 = bind(F)();
    const result2 = bind(F)();

    expect(result1).not.toBe(result2);
  }

  {
    const bound = bind(F);
    const result1 = bound();
    const result2 = bound();

    expect(result1).toBe(result2);
  }
})

it('holds memoized callback (hook)', () => {

  const dep = 'static';

  const F: FunctionReturner = (): () => number => {

    const x = Math.random();
    const foo = useCallback(() => x, [dep]);

    return foo;
  };

  {
    const result1 = bind(F)();
    const result2 = bind(F)();

    expect(result1).not.toBe(result2);
  }

  {
    const bound = bind(F);
    const result1 = bound();
    const result2 = bound();

    expect(result1).toBe(result2);
  }
});

it('holds state in memoized component (hook)', () => {

  let i: number;
  const F: PropNumberReturner = memoArgs((x: number): number => {
    const [foo] = useState(() => Math.random());
    return foo + (i++);
  });

  {

    i = 0;
    const result1 = bind(F)(1);
    i = 0;
    const result2 = bind(F)(1);

    expect(result1).not.toBe(result2);
  }

  {
    i = 0;

    const bound = bind(F);
    const result1 = bound(1);
    const result2 = bound(1);
    const result3 = bound(2);
    const result4 = bound(2);
    const result5 = bound(3);

    expect(result2).toBe(result1);
    expect(result3).toBe(result1 + 1);
    expect(result4).toBe(result1 + 1);
    expect(result5).toBe(result1 + 2);
  }
})

it('manages a dependent resource (hook)', () => {

  const dep = 'static';
  let allocated: number;
  let disposed: number;

  const F: NullReturner = () => {

    useResource((dispose) => {
      allocated++;
      dispose(() => { disposed++ });
    }, [dep]);

    return null;
  };

  const G: NullReturner = () => {

    const x = Math.random();
    useResource((dispose) => {
      allocated++;
      dispose(() => { disposed++ });
    }, [x]);

    return null;
  };

  const H: NullReturner = () => {

    const x = Math.random();
    useResource((dispose) => {
      allocated++;
      dispose(() => { disposed++ });
      return allocated;
    }, [x]);

    return null;
  };

  {
    allocated = 0;
    disposed = 0;

    const {fiber, disposal} = makeHostFiber(use(F)());
    fiber.bound!();

    expect(allocated).toBe(1);
    expect(disposed).toBe(0);

    fiber.bound!();

    expect(allocated).toBe(1);
    expect(disposed).toBe(0);

    disposal.dispose(fiber);

    expect(allocated).toBe(1);
    expect(disposed).toBe(1);

  }

  {
    allocated = 0;
    disposed = 0;

    const {fiber, disposal} = makeHostFiber(use(G)());
    fiber.bound!();

    expect(allocated).toBe(1);
    expect(disposed).toBe(0);

    fiber.bound!();

    expect(allocated).toBe(2);
    expect(disposed).toBe(1);

    disposal.dispose(fiber);

    expect(allocated).toBe(2);
    expect(disposed).toBe(2);

  }

  {
    allocated = 0;
    disposed = 0;

    const {fiber, disposal} = makeHostFiber(use(H)());
    fiber.bound!();

    expect(allocated).toBe(1);
    expect(disposed).toBe(0);

    fiber.bound!();

    expect(allocated).toBe(2);
    expect(disposed).toBe(1);

    disposal.dispose(fiber);

    expect(allocated).toBe(2);
    expect(disposed).toBe(2);

  }
})

it("provides a context", () => {

  const Context = makeContext();
  let value1 = null;
  let value2 = null;

  const Root = () =>
    provide(Context, 123, [
      use(Sub)()
    ]);

  const Sub = () => {
    value1 = useContext(Context);
    return use(Node)();
  }
  const Node = () => {
    value2 = useContext(Context);
  };

  const result = renderSync(use(Root)());
  expect(result.f).toBe(Root);

  expect(result.mount).toBeTruthy();
  expect(result.mount!.mounts).toBeTruthy();

  expect(value1).toBe(123);
  expect(value2).toBe(123);
});

it("provides a changing context value", () => {

  const Context = makeContext();
  let value1 = null as number | null;
  let value2 = null as number | null;

  let trigger = null as Function | null;

  const Root = () => {
    const [state, setState] = useState<number>(123);
    trigger = () => setState(456);
    return provide(Context, state, [
      use(Sub)()
    ]);
  }

  const Sub = () => {
    value1 = useContext(Context);
    return use(Node)();
  }
  const Node = () => {
    value2 = useContext(Context);
  };

  const result = renderSync(use(Root)());
  expect(result.f).toBe(Root);
  if (!result.host) return;

  const {host: {flush}} = result;

  expect(result.mount).toBeTruthy();
  expect(result.mount!.mounts).toBeTruthy();

  expect(value1).toBe(123);
  expect(value2).toBe(123);

  trigger!();
  flush();

  expect(value1).toBe(456);
  expect(value2).toBe(456);
});


it("provides a changing context value on a memoized component", () => {

  const Context = makeContext();
  let value = null as number | null;

  let trigger = null as Function | null;

  const Root = () => {
    const [state, setState] = useState<number>(123);
    trigger = () => setState(456);
    return provide(Context, state, [
      use(Sub)()
    ]);
  }

  const Sub = () => {
    // @ts-ignore
    return use(Node)();
  };

  const Node = memoProps(() => {
    value = useContext(Context);
  });

  const result = renderSync(use(Root)());
  expect(result.f).toBe(Root);
  if (!result.host) return;

  const {host: {flush}} = result;

  expect(result.mount).toBeTruthy();
  expect(result.mount!.mounts).toBeTruthy();

  expect(value).toBe(123);

  trigger!();
  flush();

  expect(value).toBe(456);
});

it("provides a changing context value with a memoized component in the way", () => {

  const Context = makeContext();
  let value = null as number | null;

  let trigger = null as Function | null;

  const Root = () => {
    const [state, setState] = useState<number>(123);
    trigger = () => setState(456);
    return provide(Context, state, [
      use(Sub)()
    ]);
  }

  const Sub = memoProps(() => {
    return use(Node)();
  });

  const Node = () => {
    value = useContext(Context);
  };

  const result = renderSync(use(Root)());
  expect(result.f).toBe(Root);
  if (!result.host) return;

  const {host: {flush}} = result;

  expect(result.mount).toBeTruthy();
  expect(result.mount!.mounts).toBeTruthy();

  expect(value).toBe(123);

  trigger!();
  flush();

  expect(value).toBe(456);
});
