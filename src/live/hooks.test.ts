import { LiveContext, LiveComponent, Live, DeferredCall } from './types';

import { bind, defer } from './live';
import { makeHostContext } from './tree';
import { useCallback, useMemo, useOne, useResource, useState, memoFunction } from './hooks';

type NullReturner = () => null;
type NumberReturner = () => number;
type FunctionReturner = () => () => any;

it('memoizes a function', () => {

  const F: Live<NumberReturner> = memoFunction(() => (): number => {
    return Math.random();
  });

  {
    const bound = bind(F);
    const result1 = bound();
    const result2 = bound();

    expect(result1).toBe(result2);
  }
})

it('holds state (hook)', () => {

  const F: Live<NumberReturner> = (context: LiveContext<NumberReturner>) => (): number => {
    const [foo] = useState(context, 0)(() => Math.random());
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

  const F: Live<NumberReturner> = (context: LiveContext<NumberReturner>) => (): number => {

    const foo = useMemo(context, 0)(() => Math.random(), [dep]);

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

  const F: Live<NumberReturner> = (context: LiveContext<NumberReturner>) => (): number => {

    const foo = useOne(context, 0)(() => Math.random(), dep);

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

  const F: Live<FunctionReturner> = (context: LiveContext<FunctionReturner>) => (): () => number => {

    const x = Math.random();
    const foo = useCallback(context, 0)(() => x, [dep]);

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

it('manages a dependent resource (hook)', () => {

  const dep = 'static';
  let allocated: number;
  let disposed: number;

  const F: Live<NullReturner> = (context: LiveContext<NullReturner>): NullReturner => () => {

    useResource(context, 0)((dispose) => {
      allocated++;
      dispose(() => { disposed++ });
    }, [dep]);

    return null;
  };

  const G: Live<NullReturner> = (context: LiveContext<NullReturner>): NullReturner => () => {

    const x = Math.random();
    useResource(context, 0)((dispose) => {
      allocated++;
      dispose(() => { disposed++ });
    }, [x]);

    return null;
  };

  const H: Live<NullReturner> = (context: LiveContext<NullReturner>): NullReturner => () => {

    const x = Math.random();
    useResource(context, 0)((dispose) => {
      allocated++;
      dispose(() => { disposed++ });
      return allocated;
    }, [x]);

    return null;
  };

  {
    allocated = 0;
    disposed = 0;

    const {context, tracker} = makeHostContext(defer(F)());
    context.bound();

    expect(allocated).toBe(1);
    expect(disposed).toBe(0);

    context.bound();

    expect(allocated).toBe(1);
    expect(disposed).toBe(0);

    tracker.dispose(context);

    expect(allocated).toBe(1);
    expect(disposed).toBe(1);

  }

  {
    allocated = 0;
    disposed = 0;

    const {context, tracker} = makeHostContext(defer(G)());
    context.bound();

    expect(allocated).toBe(1);
    expect(disposed).toBe(0);

    context.bound();

    expect(allocated).toBe(2);
    expect(disposed).toBe(1);

    tracker.dispose(context);

    expect(allocated).toBe(2);
    expect(disposed).toBe(2);

  }

  {
    allocated = 0;
    disposed = 0;

    const {context, tracker} = makeHostContext(defer(H)());
    context.bound();

    expect(allocated).toBe(1);
    expect(disposed).toBe(0);

    context.bound();

    expect(allocated).toBe(2);
    expect(disposed).toBe(1);

    tracker.dispose(context);

    expect(allocated).toBe(2);
    expect(disposed).toBe(2);

  }
})
