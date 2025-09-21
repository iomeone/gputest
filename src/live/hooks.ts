import {
  Initial, Setter, Reducer, Key, Task,
  LiveFunction, LiveFiber, LiveContext,
  DeferredCall, HostInterface,
} from './types';

import { bind, CURRENT_FIBER } from './live';
import { makeFiber, makeSubFiber, bustFiberCaches, scheduleYeetRoots } from './fiber';
import { isSameDependencies } from './util';
import { formatNode } from './debug';

export const NOP = () => {};
export const NO_DEPS = [] as any[];
export const NO_RESOURCE = {tag: null, value: null};
export const STATE_SLOTS = 2;

export const reserveState = (slots: number) => slots * STATE_SLOTS;
export const pushState = <F extends Function>(fiber: LiveFiber<F>) => {
  if (!fiber.state) fiber.state = [];

  const i = fiber.pointer;
  fiber.pointer += STATE_SLOTS;

  return i;
}

// Memoize a live function on all its arguments (shallow comparison per arg)
// Unlike <Memo> this does not create a new sub-fiber
export const memoArgs = <F extends Function>(
  f: LiveFunction<F>,
  name?: string,
) => {
  const g = ((
    fiber: LiveFiber<F>,
  ) => {
    const bound = bind(f, fiber, reserveState(1));
    fiber.version = 1;
    return (...args: any[]) => {
      args.push(fiber.version);

      const value = useMemo(() => {
        fiber.memo = -1;
        return bound(args);
      }, args);
      return value;
    };
  }) as any as LiveFunction<F>;
  (g as any).displayName = name != null ? `Memo(${name})` : `Memo`;
  return g;
}

// Memoize a live function with 1 argument on its object props (shallow comparison per arg)
export const memoProps = <F extends Function>(
  f: LiveFunction<F>,
  name?: string,
) => {
  const g = ((
    fiber: LiveFiber<F>,
  ) => {
    const bound = bind(f, fiber, reserveState(1));
    fiber.version = 1;
    return (props: Record<string, any>) => {
      const deps = [fiber.version] as any[];
      for (let k in props) {
        deps.push(k);
        deps.push(props[k]);
      }

      const value = useMemo(() => {
        fiber.memo = -1;
        return bound(props);
      }, deps);

      return value;
    };
  }) as any as LiveFunction<F>;
  (g as any).displayName = name != null ? `Memo(${name})` : `Memo`;
  return g;
}

// Shorthand
export const memo = memoProps;

// Allocate state value and a setter for it, initializing with the given value or function
export const useState = <T>(
  initialState: Initial<T>,
): [
  T,
  Setter<T>,
] => {
  const fiber = CURRENT_FIBER;
  if (!fiber) throw new Error("Calling a hook outside a bound function");

  const i = pushState(fiber);
  let {state, host, yeeted} = fiber;

  let value    = state[i];
  let setValue = state[i + 1];

  if (value === undefined) {
    value = (initialState instanceof Function) ? initialState() : initialState;
    setValue = host
      ? (value: Reducer<T>) => {
          host!.schedule(fiber, () => {
            if (value instanceof Function) state[i] = value(state[i]);
            else state[i] = value;
            bustFiberCaches(fiber);
            scheduleYeetRoots(fiber);
          });
        }
      : NOP;

    state[i] = value;
    state[i + 1] = setValue;
  }

  return [value as unknown as T, setValue];
}

// Memoize a value with given dependencies
export const useMemo = <T>(
  initialState: () => T,
  dependencies: any[] = NO_DEPS,
): T => {
  const fiber = CURRENT_FIBER;
  if (!fiber) throw new Error("Calling a hook outside a bound function");

  const i = pushState(fiber);
  let {state, host} = fiber;

  let value = state[i];
  const deps = state[i + 1];

  if (!isSameDependencies(deps, dependencies)) {
    value = initialState();

    state[i] = value;
    state[i + 1] = dependencies;
  }

  return value as unknown as T;
}

// Memoize a value with one dependency
export const useOne = <T>(
  initialState: () => T,
  dependency: any = null,
): T => {
  const fiber = CURRENT_FIBER;
  if (!fiber) throw new Error("Calling a hook outside a bound function");

  const i = pushState(fiber);
  let {state, host} = fiber;

  let value = state[i];
  const dep = state[i + 1];

  if (dep !== dependency) {
    value = initialState();

    state[i] = value;
    state[i + 1] = dependency;
  }

  return value as unknown as T;
}

// Memoize a function with given dependencies
export const useCallback = <T extends Function>(
  initialValue: T,
  dependencies: any[] = NO_DEPS,
): T => {
  const fiber = CURRENT_FIBER;
  if (!fiber) throw new Error("Calling a hook outside a bound function");

  const i = pushState(fiber);
  let {state, host} = fiber;

  let value = state[i];
  const deps = state[i + 1];

  if (!isSameDependencies(deps, dependencies)) {
    value = initialValue;

    state[i] = value;
    state[i + 1] = dependencies;
  }

  return value as unknown as T;
}

// Bind immediately to a resource, with auto-cleanup on dep change or unmount
export const useResource = <R>(
  callback: (dispose: (f: Function) => void) => R,
  dependencies: any[] = NO_DEPS,
): R => {
  const fiber = CURRENT_FIBER;
  if (!fiber) throw new Error("Calling a hook outside a bound function");

  const i = pushState(fiber);
  let {state, host} = fiber;

  let {tag} = state[i] || NO_RESOURCE;
  const deps = state[i + 1];

  if (!isSameDependencies(deps, dependencies)) {

    if (!tag) {
      tag = makeResourceTag();
      state[i] = {tag, value: null};

      if (host) host.track(fiber, tag);
    }
    else {
      tag(null);
    }

    state[i + 1] = dependencies;

    const value = callback(tag);
    state[i].value = value;
    return value;
  }

  // Assume if return type is used, it's T's
  return (undefined as unknown as R);
}

// Grab a context from the fiber
export const useContext = <C>(
  context: LiveContext<C>,
) => {
  const fiber = CURRENT_FIBER;
  if (!fiber) throw new Error("Calling a hook outside a bound function");

  const {host, context: {values, roots}} = fiber;
  const root = roots.get(context)!;

  if (host && host.depend(fiber, root)) {
    host.track(fiber, () => host.undepend(fiber, root));
  }

  return values.get(context).current ?? context.initialValue;
}

// Cleanup effect tracker
// Calls previous cleanup before accepting new one
export const makeResourceTag = () => {
  let cleanup = undefined as Task | undefined;

  return (f?: Task) => {
    if (cleanup) cleanup();
    cleanup = f;
  }
}
