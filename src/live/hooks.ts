import type {
  Initial, Setter, Reducer, Key, Task,
  LiveFunction, LiveFiber, LiveContext, LiveCapture,
  DeferredCall, HostInterface, RefObject, MutableRefObject,
} from './types';
import { Hook } from './types';

import { bind, bustFiberMemo, getArgCount } from './fiber';
import { getCurrentFiber } from './current';
import { isSameDependencies, incrementVersion } from './util';
import { formatNode } from './debug';

const NOP = () => {};
const NO_DEPS = [] as any[];
const NO_RESOURCE = {tag: null, value: null};
const STATE_SLOTS = 3;

export const reserveState = (slots: number) => slots * STATE_SLOTS;

export const pushState = <F extends Function>(fiber: LiveFiber<F>, hookType: Hook) => {
  let {state, pointer} = fiber;
  if (!state) state = fiber.state = [];
  fiber.pointer += STATE_SLOTS;

  const marker = state![pointer];
  if (marker === undefined) state![pointer] = hookType;
  else if (marker !== hookType) throw new Error("Hooks were not called in the same order as last render.");

  return pointer + 1;
}

export const discardState = <F extends Function>(fiber: LiveFiber<F>) => {
  let {state, pointer} = fiber;
  if (!state) return;

  let n = state.length;
  if (n) while (fiber.pointer < n) {
    const i = fiber.pointer;
    const type = state[i];
    switch (type) {
      case Hook.STATE:
      case Hook.MEMO:
      case Hook.ONE:
      case Hook.CALLBACK:
      case Hook.VERSION:
        useNoHook(type)();
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
  if (!fiber) throw new Error("Live Hook called outside of rendering cycle.\n\nMake sure you are not accidentally running two copies of the Live run-time side-by-side.");
  return fiber;
}
export const useNoFiber = () => {};

export const useNoHook = (hookType: Hook) => () => {
  const fiber = useFiber();

  const i = pushState(fiber, hookType);
  const {state} = fiber;
  state![i] = undefined;
  state![i + 1] = undefined;
};

/**
 * Memoize a live function on all its arguments (shallow comparison per arg)
 */
export const memoArgs = <F extends Function>(
  f: LiveFunction<F>,
  name?: string,
) => {
  const inner = (...args: any[]) => {
    const fiber = useFiber();
    if (!fiber.version) fiber.version = 1;

    args.push(fiber.version);

    let skip = true;
    const value = useMemo(() => {
      fiber.memo = -1;
      skip = false;
      return f(...args);
    }, args);

    if (skip) fiber.pointer = fiber.state!.length;

    return value;
  };

  const memoName = `Memo(${name ?? f.name})`;
  const length = getArgCount(f);
  return new Proxy(inner, { get: (target: any, s: string) => {
    if (s === 'length') return length;
    if (s === 'name') return memoName;
    return target[s];
  }});
};

/**
 * Memoize a live function with 1 argument on its object props (shallow comparison per arg)
 */
export const memoProps = <F extends Function>(
  f: LiveFunction<F>,
  name?: string,
) => {
  const inner = (props: Record<string, any>[]) => {
    const fiber = useFiber();
    if (!fiber.version) fiber.version = 1;

    const deps = [fiber.version] as any[];
    for (let k in props) {
      deps.push(k);
      deps.push(props[k]);
    }

    let skip = true;
    const value = useMemo(() => {
      fiber.memo = -1;
      skip = false;
      return f(props);
    }, deps);

    if (skip) fiber.pointer = fiber.state!.length;

    return value;
  };

  const memoName = `Memo(${name ?? f.name})`;
  const length = getArgCount(f);
  const p = new Proxy(inner, { get: (target: any, s: string) => {
    if (s === 'length') return length;
    if (s === 'name') return memoName;
    return target[s];
  }});
  p.displayName = memoName;
  return p;
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
  let {state, host, yeeted} = fiber;

  let value    = state![i];
  let setValue = state![i + 1];

  if (setValue === undefined) {
    value = (initialState instanceof Function) ? initialState() : initialState;
    setValue = host
      ? (value: Reducer<T>) => {
          if (state![i - 1] !== Hook.STATE) return;

          const apply = () => {
            const prev = state![i];

            let next: any;
            if (value instanceof Function) next = value(prev);
            else next = value;

            if (prev !== next) {
              state![i] = next;
              bustFiberMemo(fiber);
              return true;
            }
            return false;
          };

          if (fiber === getCurrentFiber()) {
            if (apply()) {
              host!.visit(fiber);
            }
          }
          else {
            host!.schedule(fiber, apply);
          }
        }
      : NOP;

    state![i] = value;
    state![i + 1] = setValue;
  }

  return [value as unknown as T, setValue];
}

/**
 * Memoize a value with given dependencies
 */
export const useMemo = <T>(
  initialState: () => T,
  dependencies: any[] = NO_DEPS,
): T => {
  const fiber = useFiber();

  const i = pushState(fiber, Hook.MEMO);
  let {state, host} = fiber;

  let value = state![i];
  const deps = state![i + 1];

  if (!isSameDependencies(deps, dependencies)) {
    value = initialState();

    state![i] = value;
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
  let {state, host} = fiber;

  let value = state![i];
  const dep = state![i + 1];

  if (dep !== dependency) {
    value = initialState();

    state![i] = value;
    state![i + 1] = dependency;
  }

  return value as unknown as T;
}

/**
 * Memoize a function with given dependencies
 */
export const useCallback = <T extends Function>(
  initialValue: T,
  dependencies: any[] = NO_DEPS,
): T => {
  const fiber = useFiber();

  const i = pushState(fiber, Hook.CALLBACK);
  let {state, host} = fiber;

  let value = state![i];
  const deps = state![i + 1];

  if (!isSameDependencies(deps, dependencies)) {
    value = initialValue;

    state![i] = value;
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
  let {state, host, yeeted} = fiber;

  let value   = state![i];
  let version = state![i + 1] || 0;
  if (value !== nextValue) {
    state![i] = nextValue;
    state![i + 1] = version = incrementVersion(state![i + 1]);
  }

  return version;
}

/**
 * Bind immediately to a resource, with auto-cleanup on dep change or unmount
 */
export const useResource = <R>(
  callback: (dispose: (f: Function) => void) => R,
  dependencies: any[] = NO_DEPS,
): R => {
  const fiber = useFiber();

  const i = pushState(fiber, Hook.RESOURCE);
  let {state, host} = fiber;

  let {tag} = state![i] ?? NO_RESOURCE;
  const deps = state![i + 1];

  if (!isSameDependencies(deps, dependencies)) {

    if (!tag) {
      tag = makeResourceTag();
      state![i] = {tag, value: null};

      if (host) host.track(fiber, tag);
    }
    else {
      tag(null);
    }

    state![i + 1] = dependencies;

    const value = callback(tag);
    state![i].value = value;
    return value;
  }

  return state![i].value as R;
}

/**
 * Don't use a resource hook (clean up prior tag)
 */
export const useNoResource = () => {
  const fiber = useFiber();

  const i = pushState(fiber, Hook.RESOURCE);
  let {state, host} = fiber;

  let {tag} = state![i] ?? NO_RESOURCE;
  if (tag) {
    tag(null);
    if (host) host.untrack(fiber, tag);
  }

  state![i] = undefined;
  state![i + 1] = undefined;
}

/**
 * Grab a context from the fiber (optional mode)
 */
export const useContext = <C>(
  context: LiveContext<C>,
): C => {
  const fiber = useFiber();

  const i = pushState(fiber, Hook.CONTEXT);
  const {state, host, context: {values, roots}} = fiber;
  const root = roots.get(context);
  if (!root) {
    const {initialValue, displayName} = context;
    if (initialValue === undefined) {
      throw new Error(`Required context '${displayName}' was used without being provided.`);
    }
    state![i] = false;
    state![i + 1] = context;
    return initialValue;
  }

  if (host) {
    if (!state![i]) {
      state![i] = true;
      state![i + 1] = context;
      host.track(fiber, () => host.undepend(fiber, root));
    }

    host.depend(fiber, root);
  }

  return values.get(context).current ?? context.initialValue;
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
  const root = roots.get(context);
  if (!root || !root.next) throw new Error(`Context '${context.displayName}' was used without being captured.`);

  const {next} = root;
  if (host) {
    if (!state![i]) {
      state![i] = true;
      state![i + 1] = context;
      host.track(fiber, () => {
        registry.delete(fiber);
        host.schedule(next, NOP);
        host.undepend(next, fiber);
      });

      host.depend(next, fiber);
    }

    host.visit(next);
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
  const {state, host, context: {values, roots}} = fiber;
  if (!context) {
    throw new Error(`Context is undefined.`);
  }

  const root = roots.get(context)!;
  if (state![i]) {
    if (host) host.undepend(fiber, root);
    state![i] = false;
  }

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
  if (!context) throw new Error(`Capture is undefined.`);

  const root = roots.get(context)!;
  const next = root.next;
  if (state![i] && next) {
    if (host) host.undepend(next, fiber);
    state![i] = false;
  }

  state![i + 1] = undefined;
}

// Togglable hooks
export const useNoState = useNoHook(Hook.STATE);
export const useNoMemo = useNoHook(Hook.MEMO);
export const useNoOne = useNoHook(Hook.ONE);
export const useNoCallback = useNoHook(Hook.CALLBACK);
export const useNoVersion = useNoHook(Hook.VERSION);

/**
 * On-change logger
 */
export const useLog = (value: any, name?: string) => useOne(() => console.log(value, name), value);
export const useNoLog = useNoOne;

/**
 * Async wrapper
 */
export const useAsync = <T, E = Error>(f: () => Promise<T>, deps: any[] = NO_DEPS): [T | undefined, E | undefined] => {
  const [value, setValue] = useState<[T | undefined, E | undefined]>([undefined, undefined]);

  const ref = useResource((dispose) => {
    let cancelled = false;
    f()
    .then(value => !cancelled && setValue([value, undefined]))
    .catch(error => !cancelled && setValue([undefined, error]));
    dispose(() => { cancelled = true; });
  }, deps);

  return value;
};

export const useNoAsync = () => {
  useNoState();
  useNoResource();
};

/**
 * Ref emulator
 */
interface UseRef {
  <T>(current?: T | null): RefObject<T>;
  <T>(current?: T): MutableRefObject<T>;
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
