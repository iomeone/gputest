import type {
  Initial, Setter, Reducer, DoubleState, Task, ArrowFunction,
  LiveFunction, LiveFiber, LiveContext, LiveCapture,
  Ref, RefObject, MutableRefObject,
} from './types';
import { Hook } from './types';

import { bustFiberMemo, getArgCount } from './fiber';
import { getCurrentFiber } from './current';
import { isSameDependencies, incrementVersion } from './util';
import { formatNode } from './debug';

const NOP = () => {};
const NO_DEPS = [] as any[];
const NO_RESOURCE = {tag: null, value: null};
const STATE_SLOTS = 3;

const HOOK_NAMES = ['useState', 'useMemo', 'useOne', 'useCallback', 'useResource', 'useContext', 'useCapture', 'useVersion', 'useHooks'];

export const reserveState = (slots: number) => slots * STATE_SLOTS;

export const pushState = <F extends Function>(fiber: LiveFiber<F>, hookType: Hook) => {
  // eslint-disable-next-line prefer-const
  let {state, pointer} = fiber;
  if (!state) state = fiber.state = [];
  fiber.pointer += STATE_SLOTS;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const marker = state![pointer];
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  if (marker === undefined) state![pointer] = hookType;
  else if (marker !== hookType) throw new Error(`Hooks were not called in the same order as last render in ${formatNode(fiber)}.\nExpected '${HOOK_NAMES[marker]}', got '${HOOK_NAMES[hookType] ?? 'unknown'}'`);

  return pointer + 1;
}

export const discardState = <F extends Function>(fiber: LiveFiber<F>) => {
  const {state, pointer} = fiber;
  if (!state) return;

  const n = state.length;
  if (n) while (fiber.pointer < n) {
    const i = fiber.pointer;
    const type = state[i];
    switch (type) {
      default:
        useNoHook(type)();
        break;
      case Hook.HOOKS:
        if (state[i + 1]) useNoHooks();
        else fiber.pointer += 3;
        break;
      case Hook.RESOURCE:
        useNoResource();
        break;
      case Hook.CONTEXT:
        if (state[i + 1]) useNoContext(state[i + 2]);
        else fiber.pointer += 3;
        break;
      case Hook.CAPTURE:
        if (state[i + 1]) useNoCapture(state[i + 2]);
        else fiber.pointer += 3;
        break;
    }
  }
  state.length = pointer;
}

/**
 * Return current fiber.
 */
export const useFiber = () => {
  const fiber = getCurrentFiber();
  if (!fiber) throw new Error(`Live Hook called outside of rendering cycle in ${formatNode(fiber)}.\n\nMake sure you are not accidentally running two copies of '@use-gpu/live' side-by-side. Check your 'node_modules/'.`);
  return fiber;
}

export const useFiberId = () => useFiber().id;

export const useNoHook = (hookType: Hook) => () => {
  const fiber = useFiber();

  const i = pushState(fiber, hookType);
  const {state} = fiber;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  state![i] = undefined;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  state![i + 1] = undefined;
};

type IsEqualMemoArgs<T extends Array<any>> = (prevArgs: T, nextArgs: T) => boolean;
type IsEqualMemoProps<T> = (prevProps: T, nextArgs: T) => boolean;

const makeDeps = (): any[] => [];

/**
 * Memoize a live function on all its arguments (shallow comparison per arg)
 */
export const memoArgs = <F extends ArrowFunction>(
  f: LiveFunction<F>,
  isEqualOrName?: IsEqualMemoArgs<Parameters<F>> | string,
  name?: string,
) => {
  const customMemo = typeof isEqualOrName === 'function' ? isEqualOrName as IsEqualMemoArgs<any> : null;
  if (typeof isEqualOrName === 'string') name = isEqualOrName;

  const memoized = (...args: any[]) => {
    const fiber = useFiber();
    if (!fiber.version) fiber.version = 1;

    const ref = useRef(args);

    if (fiber.version === fiber.memo) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (customMemo && !customMemo(ref.current, args)) fiber.version = incrementVersion(fiber.version!);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      else if (ref.current !== args && !isSameDependencies(ref.current, args)) fiber.version = incrementVersion(fiber.version!);
    }

    ref.current = args;

    return useHooks(() => f(...args), fiber.version);
  };

  const memoName = `Memo(${name ?? f.name ?? 'Component'})`;
  const length = getArgCount(f);

  return new Proxy(memoized, { get: (target: any, s: string) => {
    if (s === 'length') return length;
    if (s === 'name') return memoName;
    if (s === 'argCount') return length;
    return target[s];
  }}) as LiveFunction<F>;
};

/**
 * Memoize a live function with 1 argument on its object props (shallow comparison per arg)
 */
export const memoProps = <F extends ArrowFunction>(
  f: LiveFunction<F>,
  isEqualOrName?: IsEqualMemoProps<Parameters<F>[0]> | string,
  name?: string,
) => {
  const customMemo = typeof isEqualOrName === 'function' ? isEqualOrName as IsEqualMemoArgs<any> : null;
  if (typeof isEqualOrName === 'string') name = isEqualOrName;

  const memoized = (customMemo
    ? (props: Record<string, any>) => {
      const fiber = useFiber();
      if (!fiber.version) fiber.version = 1;

      const ref = useRef(props);

      if (fiber.version === fiber.memo) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (!customMemo(ref.current, props)) fiber.version = incrementVersion(fiber.version!);
      }
      ref.current = props;

      return useHooks(() => f(props), fiber.version);
    }
    : (props: Record<string, any>) => {
      const fiber = useFiber();
      if (!fiber.version) fiber.version = 1;

      const [swapDeps, getDeps] = useDouble(makeDeps);
      const [deps, saved] = getDeps();

      deps.length = 0;
      for (const k in props) {
        deps.push(k);
        deps.push(props[k]);
      }

      if (fiber.version === fiber.memo) {
        if (!isSameDependencies(deps, saved)) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          fiber.version = incrementVersion(fiber.version!);
        }
      }
      swapDeps();

      return useHooks(() => f(props), fiber.version);
    }
  );

  const memoName = `Memo(${name ?? f.name ?? 'Component'})`;
  const length = getArgCount(f);

  return new Proxy(memoized, { get: (target: any, s: string) => {
    if (s === 'length') return length;
    if (s === 'name') return memoName;
    return target[s];
  }}) as LiveFunction<F>;
}

/**
 * Memoize a live component on its props (shallow comparison per arg)
 */
export const memo = memoProps;

/**
 * Allocate a state value and a setter for it, initializing with the given value or function.
 */
export const useState = <T>(
  initialState: Initial<T>,
): [
  T,
  Setter<T>,
] => {
  const fiber = useFiber();

  const i = pushState(fiber, Hook.STATE);
  const {state, host} = fiber;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  let value    = state![i];
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  let setValue = state![i + 1];

  if (setValue === undefined) {
    value = (initialState instanceof Function) ? initialState() : initialState;  // <- Step through here
    setValue = host
      ? (value: Reducer<T>) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          if (state![i - 1] !== Hook.STATE) return;

          const apply = () => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const prev = state![i];

            let next: any;
            if (value instanceof Function) next = value(prev);
            else next = value;

            if (prev !== next) {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              state![i] = next;
              bustFiberMemo(fiber);
              return true;
            }
            return false;
          };

          if (fiber === getCurrentFiber()) {
            if (apply()) {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              host!.visit(fiber);
            }
          }
          else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            host!.schedule(fiber, apply);
          }
        }
      : NOP;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    state![i] = value;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    state![i + 1] = setValue;
  }

  return [value as unknown as T, setValue];
}

/**
 * Memoize a value with given dependencies
 */
export const useMemo = <T>(
  initialState: () => T,
  dependencies: any[] = NO_DEPS
): T => {
  const fiber = useFiber();

  const i = pushState(fiber, Hook.MEMO);
  const {state} = fiber;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  let value = state![i];
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const deps = state![i + 1];

  if (!isSameDependencies(deps, dependencies)) {
    value = initialState(); // <- Step through here

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    state![i] = value;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    state![i + 1] = dependencies;
  }

  return value as unknown as T;
}

/**
 * Memoize a value with one dependency
 */
export const useOne = <T>(
  initialState: () => T,
  dependency: any = null,
): T => {
  const fiber = useFiber();

  const i = pushState(fiber, Hook.ONE);
  const {state} = fiber;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  let value = state![i];
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const dep = state![i + 1];

  if (dep !== dependency) {
    value = initialState();  // <- Step through here

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    state![i] = value;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    state![i + 1] = dependency;
  }

  return value as unknown as T;
}

/**
 * Memoize a function with given dependencies
 */
export const useCallback = <T extends Function>(
  initialValue: T,
  dependencies: any[] = NO_DEPS
): T => {
  const fiber = useFiber();

  const i = pushState(fiber, Hook.CALLBACK);
  const {state} = fiber;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  let value = state![i];
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const deps = state![i + 1];

  if (!isSameDependencies(deps, dependencies)) {
    value = initialValue;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    state![i] = value;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    state![i + 1] = dependencies;
  }

  return value as unknown as T;
}

/**
 * Incrementing version counter, +1 for every change.
 */
export const useVersion = <T>(nextValue: T) => {
  const fiber = useFiber();

  const i = pushState(fiber, Hook.VERSION);
  const {state} = fiber;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const value = state![i];
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  let version = state![i + 1] || 0;
  if (value !== nextValue) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    state![i] = nextValue;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    state![i + 1] = version = incrementVersion(state![i + 1]);
  }

  return version;
}

/**
 * Bind immediately to a resource, with auto-cleanup on dep change or unmount
 */
export const useResource = <R>(
  callback: (dispose: (f: Function) => void) => R,
  dependencies: any[] = NO_DEPS
): R => {
  const fiber = useFiber();

  const i = pushState(fiber, Hook.RESOURCE);
  const {state, host} = fiber;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  let {tag} = state![i] ?? NO_RESOURCE;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const deps = state![i + 1];

  if (!isSameDependencies(deps, dependencies)) {

    if (!tag) {
      tag = makeResourceTag();
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      state![i] = {tag, value: null};

      if (host) host.track(fiber, tag);
    }
    else {
      tag(null);
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    state![i + 1] = dependencies;

    const value = callback(tag); // <- Step through here
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    state![i].value = value;
    return value;
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return state![i].value as R;
}

/**
 * Don't use a resource hook (clean up prior tag)
 */
export const useNoResource = () => {
  const fiber = useFiber();

  const i = pushState(fiber, Hook.RESOURCE);
  const {state, host} = fiber;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const {tag} = state![i] ?? NO_RESOURCE;
  if (tag) {
    tag(null);
    if (host) host.untrack(fiber, tag);
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  state![i] = undefined;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  state![i + 1] = undefined;
}

/**
 * Grab a context from the fiber
 */
export const useContext = <C>(
  context: LiveContext<C>,
): C => {
  const fiber = useFiber();

  const i = pushState(fiber, Hook.CONTEXT);
  const {state, host, context: {values, roots}} = fiber;
  const root = roots.get(context) as number;
  if (!context) throw new Error(`Context is undefined in ${formatNode(fiber)}.`);
  if (!root) {
    const {initialValue, displayName} = context;
    if (initialValue === undefined) {
      throw new Error(`Required context '${displayName}' was used without being provided in ${formatNode(fiber)}.`);
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    state![i] = false;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    state![i + 1] = context;
    return initialValue;
  }

  if (host) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (!state![i]) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      state![i] = true;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      state![i + 1] = context;
      host.track(fiber, () => host.undepend(fiber, root));
    }

    host.depend(fiber, root);
  }

  const value = values.get(context).current;
  return value !== undefined ? value : context.initialValue;
}

/**
 * Yield a value to a capture from the fiber
 */
export const useCapture = <C>(
  context: LiveCapture<C>,
  value: C,
) => {
  const fiber = useFiber();

  const i = pushState(fiber, Hook.CAPTURE);
  const {state, host, context: {values, roots}} = fiber;
  const root = roots.get(context) as LiveFiber<any>;
  if (!context) throw new Error(`Context is undefined in ${formatNode(fiber)}.`);
  if (!root) throw new Error(`Capture '${context.displayName}' was used without being provided in ${formatNode(fiber)}.`);

  if (host) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (!state![i]) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      state![i] = true;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      state![i + 1] = context;
      host.track(fiber, () => {
        registry.delete(fiber);
        host.schedule(root);
        host.undepend(root, fiber.id);
      });

      host.depend(root, fiber.id);
    }

    host.visit(root);
  }

  const registry = values.get(context).current;
  registry.set(fiber, value);
}

/**
 * Don't use a context from the fiber
 */
export const useNoContext = <C>(
  context: LiveContext<C>,
) => {
  const fiber = useFiber();

  const i = pushState(fiber, Hook.CONTEXT);
  const {state, host, context: {roots}} = fiber;
  if (!context) throw new Error(`Context is undefined in ${formatNode(fiber)}.`);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const root = roots.get(context)! as number;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  if (state![i]) {
    if (host) host.undepend(fiber, root);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    state![i] = false;
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  state![i + 1] = undefined;
}

/**
 * Don't use a capture from the fiber
 */
export const useNoCapture = <C>(
  context: LiveCapture<C>,
) => {
  const fiber = useFiber();

  const i = pushState(fiber, Hook.CAPTURE);
  const {state, host, context: {values, roots}} = fiber;
  if (!context) throw new Error(`Capture is undefined in ${formatNode(fiber)}.`);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const root = roots.get(context)! as LiveFiber<any>;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  if (state![i] && root) {
    const registry = values.get(context).current;
    registry.delete(fiber);

    if (host) host.undepend(root, fiber.id);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    state![i] = false;
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  state![i + 1] = undefined;
}

/**
 * Memoize a hook with given dependencies
 */
export const useHooks = <T>(
  initialState: () => T,
  dependencies: any[] | number = 0
): T => {
  const fiber = useFiber();

  const i = pushState(fiber, Hook.HOOKS);
  const {state} = fiber;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const scope = state![i];

  const {pointer} = fiber;
  const hook = typeof dependencies === 'number' ? useOne : useMemo;

  const value = hook(() => {
    try {
      fiber.pointer = 0;
      fiber.state = scope;
      return initialState();  // <- Step through here
    }
    finally {
      discardState(fiber);

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      state![i] = fiber.state;
      fiber.pointer = pointer + STATE_SLOTS;
      fiber.state = state;
    }
  }, dependencies as any);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  state![i + 1] = undefined;

  return value as unknown as T;
}

export const useNoHooks = () => {
  const fiber = useFiber();

  const i = pushState(fiber, Hook.HOOKS);
  const {pointer, state} = fiber;
  const scope = state?.[i];

  if (scope) {
    const {pointer} = fiber;
    try {
      fiber.pointer = 0;
      fiber.state = scope;
      discardState(fiber);
    }
    finally {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      state![i] = undefined;
      fiber.pointer = pointer + STATE_SLOTS;
      fiber.state = state;
    }
  }
  else {
    fiber.pointer = pointer + STATE_SLOTS;
  }
};

// Togglable hooks
export const useNoState = useNoHook(Hook.STATE);
export const useNoMemo = useNoHook(Hook.MEMO);
export const useNoOne = useNoHook(Hook.ONE);
export const useNoCallback = useNoHook(Hook.CALLBACK);
export const useNoVersion = useNoHook(Hook.VERSION);

/**
 * On-change logger for debug purposes.
 */
export const useLog = (values: Record<string, any>) => {
  for (const k in values) useOne(() => console.log(k, '=', values[k]), values[k]);
};

/**
 * Double-buffered mutable reference.
 */
export const useDouble = <T>(
  make: () => T,
  dependencies: any[] = NO_DEPS
): DoubleState<T> => useMemo(() => makeDouble(make), dependencies);

const makeDouble = <T>(make: () => T): DoubleState<T> => {
  const ref = {
    front: make(),
    back: make(),
    flip: false,
  };
  
  const front: [T, T] = [ref.front, ref.back];
  const back: [T, T] = [ref.back, ref.front];

  const get = () => {
    const f = ref.flip;
    return f ? front : back;
  };

  const swap = () => {
    let f = ref.flip;
    f = ref.flip = !ref.flip;
    return f ? ref.front : ref.back;
  };

  return [swap, get];
};

export const useNoDouble = useNoMemo;

/**
 * Async wrapper
 */
export const useAwait = <T, E = Error>(
  f: undefined | null | ((cancelled: () => boolean) => Promise<T>),
  dependencies: any[],
): [T | undefined, E | undefined, boolean] => {
  const [value, setValue] = useState<[T | undefined, E | undefined]>([(f ? undefined : null) as any, undefined]);
  const loadingRef = useRef(false);

  useResource((dispose) => {
    if (!f) return;

    loadingRef.current = true;
    let cancelled = false;
    f(() => cancelled)
    .then(value => { loadingRef.current = false; if (!cancelled) setValue([value, undefined]); })
    .catch(error => { loadingRef.current = false; if (!cancelled) setValue([undefined, error]); });
    dispose(() => { cancelled = true; });
  }, dependencies);

  return [...value, loadingRef.current];
};

export const useNoAwait = () => {
  useNoState();
  useNoRef();
  useNoResource();
};

/**
 * Ref emulator
 */
interface UseRef {
  <T>(current?: T): Ref<T>;
  <T>(current?: T | null): RefObject<T>;
  <T = undefined>(): MutableRefObject<T | undefined>;
}
export const useRef: UseRef = (<T>(current?: T | null) => useOne(() => ({current}))) as any;
export const useNoRef = useNoOne;

// Cleanup effect tracker
// Calls previous cleanup before accepting new one
/** @hidden */
export const makeResourceTag = () => {
  let cleanup = undefined as Task | undefined;

  return (f?: Task) => {
    if (cleanup) cleanup();
    cleanup = f;
  }
}
