import {
  HostInterface, LiveFiber, LiveFunction, LiveContext, LiveElement,
  FiberYeet, FiberContext, ContextValues, ContextRoots,
  OnFiber, DeferredCall, Key,
} from './types';

import { use, reconcile, morph, DETACH, RECONCILE, MAP_REDUCE, GATHER, MULTI_GATHER, YEET, MORPH, PROVIDE, CONSUME } from './builtin';
import { discardState } from './hooks';
import { renderFibers } from './tree';
import { isSameDependencies } from './util';
import { formatNode, formatNodeName } from './debug';

let ID = 0;
let DEBUG = false;
//setTimeout((() => DEBUG = false), 900);

const NO_FIBER = () => () => {};
const NOP = () => {};
const EMPTY_ARRAY = [] as any[];
const ROOT_PATH = [0] as Key[];
const NO_CONTEXT = {
  values: new Map() as ContextValues,
  roots: new Map() as ContextRoots,
};

// Hide the fiber argument like in React
export let CURRENT_FIBER = null as LiveFiber<any> | null;
export const getCurrentFiber = () => CURRENT_FIBER!;
export const getCurrentFiberID = () => CURRENT_FIBER?.id;

// Prepare to call a live function with optional given persistent fiber
export const bind = <F extends Function>(f: LiveFunction<F>, fiber?: LiveFiber<F> | null, base: number = 0) => {
  fiber = fiber ?? makeFiber(f, null);

  if (f.length === 0) {
    return () => {
      enterFiber(fiber!, base);
      const value = f();
      exitFiber(fiber!);
      return value;
    }
  }
  if (f.length === 1) {
    return (arg: any) => {
      enterFiber(fiber!, base);
      const value = f(arg);
      exitFiber(fiber!);
      return value;
    }
  }
  return (...args: any[]) => {
    enterFiber(fiber!, base);
    const value = f.apply(null, args);
    exitFiber(fiber!);
    return value;
  }
};

// Enter/exit a fiber call
let enter = 0; let exit = 0;
export const enterFiber = <F extends Function>(fiber: LiveFiber<F>, base: number) => {
  CURRENT_FIBER = fiber;

  // Reset state pointer
  fiber.pointer = base;

  // Reset yeet value
  const {yeeted} = fiber;
  if (yeeted) yeeted.value = undefined;
}

export const exitFiber = <F extends Function>(fiber: LiveFiber<F>) => {
  discardState(fiber);
  CURRENT_FIBER = null;
}

// Make a fiber for a live function
export const makeFiber = <F extends Function>(
  f: LiveFunction<F>,
  host?: HostInterface | null,
  parent?: LiveFiber<any> | null,
  args?: any[],
  by: number = parent?.id ?? 0,
  key?: Key,
): LiveFiber<F> => {
  const bound = null as any;
  const depth = parent ? parent.depth + 1 : 0;

  const id = ++ID;

  const yeeted = parent?.yeeted ? {...parent.yeeted, id, parent: parent.yeeted} : null;
  const context = parent?.context ?? NO_CONTEXT;

  let path = parent ? parent.path : ROOT_PATH;
  if (key != null) path = [...path, key];

  const self = {
    bound, f, args,
    host, depth, path,
    yeeted, context,
    state: null, pointer: 0, version: null, memo: null,
    mount: null, mounts: null, next: null, seen: null, order: null,
    type: null, id, by,
  } as LiveFiber<F>;

  self.bound = bind(f, self) as any as F;

  return self;
};

// Prepare a new sub fiber for continued rendering
export const makeSubFiber = <F extends Function>(
  parent: LiveFiber<any>,
  node: DeferredCall<F>,
  by: number = node.by ?? parent.id,
  key?: Key,
): LiveFiber<F> => {
  const {host} = parent;
  const fiber = makeFiber(node.f, host, parent, node.args, by, key) as LiveFiber<F>;
  return fiber;
}

// Make a resume continuation for a fiber
export const makeResumeFiber = <F extends Function>(
  fiber: LiveFiber<F>,
  Resume: LiveFunction<any>,
  name?: string,
): LiveFiber<any> => {

  const n = formatNodeName(fiber);
  name = name ?? (n.match(/^[A-Za-z]+\(/) ? n.slice(n.indexOf('(') + 1, -1) : n);
  Resume.displayName = `Resume(${name})`;

  const nextFiber = makeSubFiber(fiber, use(Resume)(), fiber.id, 1);

  // Adopt existing yeet context
  // which will be overwritten.
  if (fiber.yeeted) {
    nextFiber.yeeted = fiber.yeeted;
    nextFiber.yeeted.id = nextFiber.id;
  }

  return nextFiber;
}

// Make fiber yeet state
export const makeYeetState = <F extends Function, A, B>(
  fiber: LiveFiber<F>,
  nextFiber: LiveFiber<F>,
  map?: (a: A) => B,
): FiberYeet<B> => ({
  id: fiber.id,
  emit: map
    ? (fiber: LiveFiber<any>, v: A) => fiber.yeeted!.value = map(v)
    : (fiber: LiveFiber<any>, v: B) => fiber.yeeted!.value = v,
  value: undefined,
  reduced: undefined,
  parent: undefined,
  root: nextFiber,
});

// Make fiber context state
export const makeContextState = <F extends Function>(
  fiber: LiveFiber<F>,
  parent: FiberContext,
  context: LiveContext<any>,
  value: any,
): FiberContext => {
  const values = new Map(parent.values);
  const roots = new Map(parent.roots);
  roots.set(context, fiber);
  values.set(context, { current: value, memo: null, displayName: context.displayName });
  
  return {values, roots};
};

// Render a fiber
export const renderFiber = <F extends Function>(
  fiber: LiveFiber<F>,
) => {
  const {f, host} = fiber;
  host?.unvisit(fiber);

  // These built-ins that are explicitly mounted as sub-fibers,
  // so as to not collide with the parent state.
  if      ((f as any) === PROVIDE) return provideFiber(fiber);
  else if ((f as any) === CONSUME) return consumeFiber(fiber);
  else if ((f as any) === DETACH)  return detachFiber(fiber);

  const {bound, args, yeeted} = fiber;
  let element: LiveElement<any>;

  DEBUG && console.log('Rendering', formatNode(fiber));

  // Disposed fiber, ignore
  if (!bound) return;

  // Passthrough built-ins as rendered result
  if ((f as any).isLiveBuiltin) {
    element = fiber as any as DeferredCall<any>;
    // Enter/exit to clear yeet state
    bound();
  }
  // Render live function
  else element = bound.apply(null, args ?? EMPTY_ARRAY);

  // Early exit if memoized and same result
  if (fiber.version) {
    const canExitEarly = fiber.type !== YEET && !fiber.next;
    if (fiber.version !== fiber.memo) {
      fiber.memo = fiber.version;
      pingFiber(fiber);
    }
    else if (canExitEarly) return;
  }
  else {
    pingFiber(fiber);
  }

  // Apply rendered result
  return element ?? null;
}

// Ping a fiber when it's updated,
// propagating to long-range dependencies.
export const pingFiber = <F extends Function>(
  fiber: LiveFiber<F>,
) => {
  // Bust far caches
  const {host} = fiber;
  if (host) for (let sub of host.invalidate(fiber)) {
    DEBUG && console.log('Invalidating Node', formatNode(sub));
    host.visit(sub);
    bustFiberMemo(sub);
  }

  // Notify host / dev tool of update
  if (host?.__ping) host.__ping(fiber);
}

// Update a fiber with rendered result
export const updateFiber = <F extends Function>(
  fiber: LiveFiber<F>,
  element: LiveElement<any> | undefined | void,
) => {
  if (element === undefined) return;

  const {f, args, yeeted} = fiber;

  // Handle call and call[]
  let call = element as DeferredCall<any> | null;
  const isArray = !!element && Array.isArray(element);
  const fiberType = isArray ? Array : call?.f;

  // If morphing, do before noticing type change
  if (fiberType === MORPH) {
    const e = call!.args;
    const c = e as any as DeferredCall<any>;
    const cs = e as any as DeferredCall<any>[];
    const isArray = !!e && Array.isArray(e);
    const fiberType = isArray ? Array : c?.f;

    if (isArray) reconcileFiberCalls(fiber, cs.map(call => morph(call)));
    morphFiberCall(fiber, fiberType, c);
    return fiber;
  }

  // If fiber type changed, remount everything
  if (fiber.type && fiberType !== fiber.type) disposeFiberMounts(fiber);
  fiber.type = fiberType as any;

  // Reconcile literal array
  if (isArray) {
    const calls = element as DeferredCall<any>[];
    reconcileFiberCalls(fiber, calls);
  }
  // Reconcile wrapped array
  else if (fiberType === RECONCILE) {
    const calls = call!.args ?? EMPTY_ARRAY;
    reconcileFiberCalls(fiber, calls);
  }
  // Map reduce
  else if (fiberType === MAP_REDUCE) {
    const [calls, map, reduce, done] = call!.args ?? EMPTY_ARRAY;
    mapReduceFiberCalls(fiber, calls, map, reduce, done);
  }
  // Gather reduce
  else if (fiberType === GATHER) {
    const [calls, done] = call!.args ?? EMPTY_ARRAY;
    gatherFiberCalls(fiber, calls, done);
  }
  // Multi-gather reduce
  else if (fiberType === MULTI_GATHER) {
    const [calls, done] = call!.args ?? EMPTY_ARRAY;
    multiGatherFiberCalls(fiber, calls, done);
  }
  // Yeet value upstream
  else if (fiberType === YEET) {
    if (!yeeted) throw new Error("Yeet without aggregator");
    bustFiberYeet(fiber);
    visitYeetRoot(fiber);
    yeeted.emit(fiber, call!.arg);
  }
  // Mount normal node (may still be built-in)
  else {
    mountFiberCall(fiber, call);
  }

  return fiber;
}

// Mount one call on a fiber
export const mountFiberCall = <F extends Function>(
  fiber: LiveFiber<F>,
  call?: DeferredCall<any> | null,
) => {
  const {mount} = fiber;

  const nextMount = updateMount(fiber, mount, call);
  if (nextMount !== false) {
    fiber.mount = nextMount;
    flushMount(nextMount, mount);
  }
}

// Mount a continuation on a fiber
export const mountFiberContinuation = <F extends Function>(
  fiber: LiveFiber<F>,
  call: DeferredCall<any> | null,
  key?: Key,
) => {
  const {next} = fiber;

  const nextMount = updateMount(fiber, next, call, key);
  if (nextMount !== false) {
    fiber.next = nextMount;
    flushMount(nextMount, next, true);
  }
}

// Generalized mounting of reduction-like continuations
export const mountFiberReduction = <F extends Function, R, T>(
  fiber: LiveFiber<F>,
  calls: DeferredCall<any>[],
  mapper: ((t: T) => R) | undefined,
  reduction: () => R,
  Next?: LiveFunction<any>,
) => {
  const {yeeted} = fiber;
  if (!fiber.next) {
    const Resume = makeFiberContinuation(fiber, reduction);
    fiber.next = makeResumeFiber(fiber, Resume);
    fiber.yeeted = makeYeetState(fiber, fiber.next, mapper);
    fiber.path = [...fiber.path, 0];
  }

  reconcileFiberCalls(fiber, calls);
  mountFiberContinuation(fiber, use(fiber.next.f)(Next), 1);
}

// Wrap a live function to act as a continuation of a prior fiber
export const makeFiberContinuation = <F extends Function, R>(
  fiber: LiveFiber<F>,
  reduction: () => R,
) => (
  Next?: LiveFunction<any>
) => {
  const {next} = fiber;
  if (!next) return null;
  if (!Next) return null;

  const value = reduction();

  // If mounting static component, inline into current fiber
  if ((Next as any).isStaticComponent) return Next(value);
  // Mount as new sub fiber
  else return use(Next)(value);
}

// Tag a component as a static continuation
export const makeStaticContinuation = (c: LiveFunction<any>): LiveFunction<any> => {
  (c as any).isStaticComponent = true;
  return c;
}
export const resume = makeStaticContinuation;

// Reconcile multiple calls on a fiber
export const reconcileFiberCalls = <F extends Function>(
  fiber: LiveFiber<F>,
  calls: DeferredCall<any>[],
) => {
  let {mounts, order, seen} = fiber;

  if (!mounts) mounts = fiber.mounts = new Map();
  if (!order)  order  = fiber.order  = [];
  if (!seen)   seen   = fiber.seen   = new Set();

  if (!Array.isArray(calls)) calls = [calls];

  seen.clear();

  order.length = 0;
  let i = 0;
  for (let call of calls) {

    let key = call?.key ?? (0x100000000 + i);
    if (seen.has(key)) throw new Error(`Duplicate key ${key} while reconciling ` + formatNode(fiber));
    seen.add(key);
    order[i++] = key;

    // Array shorthand for nested reconciling
    if (Array.isArray(call)) call = reconcile(call as any, key);

    const mount = mounts.get(key);

    const nextMount = updateMount(fiber, mount, call, key);
    if (nextMount !== false) {
      if (nextMount) mounts.set(key, nextMount);
      else mounts.delete(key);
      flushMount(nextMount, mount);
    }
  }

  for (let key of mounts.keys()) if (!seen.has(key)) {
    const mount = mounts.get(key);
    updateMount(fiber, mount, null);
    mounts.delete(key);
    flushMount(null, mount);
  }

}

// Map-reduce a fiber
export const mapReduceFiberCalls = <F extends Function, R, T>(
  fiber: LiveFiber<F>,
  calls: DeferredCall<any>[],
  mapper: (t: T) => R,
  reducer: (a: R, b: R) => R,
  next?: LiveFunction<any>,
) => {
  const reduction = () => reduceFiberValues(fiber, reducer, true);
  return mountFiberReduction(fiber, calls, mapper, reduction, next);
}

// Gather-reduce a fiber
export const gatherFiberCalls = <F extends Function, R, T>(
  fiber: LiveFiber<F>,
  calls: DeferredCall<any>[],
  next?: LiveFunction<any>,
) => {
  const reduction = () => gatherFiberValues(fiber, true);
  return mountFiberReduction(fiber, calls, undefined, reduction, next);
}

// Multi-gather-reduce a fiber
export const multiGatherFiberCalls = <F extends Function, R, T>(
  fiber: LiveFiber<F>,
  calls: DeferredCall<any>[],
  next?: LiveFunction<any>,
) => {
  const reduction = () => multiGatherFiberValues(fiber, true);
  return mountFiberReduction(fiber, calls, undefined, reduction, next);
}

// Reduce yeeted values on a tree of fibers (values have already been mapped on emit)
export const reduceFiberValues = <F extends Function, R, T>(
  fiber: LiveFiber<F>,
  reducer: (a: R, b: R) => R,
  self: boolean = false,
): R | undefined => {
  const {yeeted, mount, mounts, order} = fiber;
  if (!yeeted) throw new Error("Reduce without aggregator");

  if (!self) {
    if (fiber.next) return reduceFiberValues(fiber.next, reducer);
    if (yeeted.value !== undefined) return yeeted.value;
  }

  if (yeeted.reduced !== undefined) return yeeted.reduced;
  if (mounts && order) {
    if (mounts.size) {
      const n = mounts.size;
      const first = mounts.get(order[0]);
      let value = reduceFiberValues(first!, reducer);
      if (n > 1) for (let i = 1; i < n; ++i) {
        const m = mounts.get(order[i]);
        if (!m) continue;
        value = reducer(value!, reduceFiberValues(m, reducer)!);
      }
      return yeeted.reduced = value;
    }
  }
  else if (mount) return yeeted.reduced = reduceFiberValues(mount, reducer);
  return undefined;
}

// Gather yeeted values on a tree of fibers
// (recursive flatMap with optional array wrapper at leafs)
export const gatherFiberValues = <F extends Function, T>(
  fiber: LiveFiber<F>,
  self: boolean = false,
): T | T[] | undefined => {
  const {yeeted, mount, mounts, order} = fiber;
  if (!yeeted) throw new Error("Reduce without aggregator");

  if (!self) {
    if (fiber.next) return gatherFiberValues(fiber.next);
    if (yeeted.value !== undefined) return yeeted.value;
  }

  if (yeeted.reduced !== undefined) return yeeted.reduced;
  if (mounts && order) {
    if (mounts.size) {
      const items = [] as T[];
      for (let k of order) {
        const m = mounts.get(k);
        if (!m) continue;

        const value = gatherFiberValues(m);
        if (Array.isArray(value)) {
          let n = value.length;
          for (let i = 0; i < n; ++i) items.push(value[i] as T);
        }
        else items.push(value as T);
      }

      return yeeted.reduced = items;
    }
  }
  else if (mount) return yeeted.reduced = gatherFiberValues(mount);
  return [];
}

// Multigather yeeted values on a tree of fibers
// (recursive key-wise flatMap with optional array wrapper at leafs)
export const multiGatherFiberValues = <F extends Function, T>(
  fiber: LiveFiber<F>,
  self: boolean = false,
): Record<string, T | T[]> => {
  const {yeeted, mount, mounts, order} = fiber;
  if (!yeeted) throw new Error("Reduce without aggregator");

  if (!self) {
    if (fiber.next) return multiGatherFiberValues(fiber.next) as any;
    if (yeeted.value !== undefined) return yeeted.value;
  }

  if (yeeted.reduced !== undefined) return yeeted.reduced;
  if (mounts && order) {
    if (mounts.size) {
      const out = {} as Record<string, T | T[]>;
      for (let k of order) {
        const m = mounts.get(k);
        if (!m) continue;

        const value = multiGatherFiberValues(m);
        for (let k in value) {
          const v = value[k];
          let list = out[k] as T[];
          if (!list) list = out[k] = [];

          if (Array.isArray(v)) {
            let n = v.length;
            for (let i = 0; i < n; ++i) list.push(v[i] as T);
          }
          else list.push(v as T);
        }
      }

      return yeeted.reduced = out;
    }
  }
  else if (mount) return yeeted.reduced = multiGatherFiberValues(mount) as any;
  return {} as Record<string, T | T[]>;
}

// Morph one call on a fiber
export const morphFiberCall = <F extends Function>(
  fiber: LiveFiber<F>,
  fiberType: any,
  call?: DeferredCall<any> | null,
) => {
  const {mount} = fiber;

  if (fiber.type && (fiber.type !== fiberType)) {
    if (call && mount && mount.context === fiber.context && !mount.next) {
      // Discard all fiber state
      enterFiber(mount, 0);
      exitFiber(mount);

      // Change type in place while keeping existing mounts
      mount.type = null;
      mount.f = call.f;
      mount.bound = bind(call.f, mount);
      mount.args = call.args;
    }
  }
  fiber.type = fiberType;

  mountFiberCall(fiber, call);
}

// Inline a call to a fiber after a built-in
export const inlineFiberCall = <F extends Function>(
  fiber: LiveFiber<F>,
  element: LiveElement<any>,
) => {
  const isArray = !!element && Array.isArray(element);
  const fiberType = isArray ? Array : element?.f;

  if (fiber.type && fiber.type !== fiberType) disposeFiberMounts(fiber);
  fiber.type = fiberType;

  if (isArray) reconcileFiberCalls(fiber, element as any);
  else {
    const call = element as DeferredCall<any>;
    if ((call?.f as any).isLiveInline) updateFiber(fiber, call);
    else mountFiberCall(fiber, call);
  }
}

// Provide a value for a context on a fiber
export const provideFiber = <F extends Function>(
  fiber: LiveFiber<F>,
) => {
  if (!fiber.args) return;
  let {args: [context, value, calls, isMemo]} = fiber;

  if (fiber.context.roots.get(context) !== fiber) {
    fiber.context = makeContextState(fiber, fiber.context, context, value);

    // If memoized, remember calls
    if (isMemo) {
      const ref = fiber.context.values.get(context);
      ref.memo = calls;
    }

    pingFiber(fiber);
  }
  else {
    // Set new value if changed
    const ref = fiber.context.values.get(context);
    const lastValue = ref.current;
    if (value !== lastValue) {
      ref.current = value;
    }
    // If memoized and mounts are identical, stop
    else if (isMemo) {
      const lastCalls = ref.memo;
      if (lastCalls === calls) return;
      ref.memo = calls;
    }

    // Invalidate downstream dependencies
    pingFiber(fiber);
  }

  inlineFiberCall(fiber, calls);
}

// Consume values from a co-context on a fiber
export const consumeFiber = <F extends Function>(
  fiber: LiveFiber<F>,
) => {
  if (!fiber.args) return;
  let {args: [context, calls, Next]} = fiber;

  pingFiber(fiber);

  if (!fiber.next) {
    const registry = new Map<LiveFiber<any>, any>();
    const reduction = () => registry;
    fiber.context = makeContextState(fiber, fiber.context, context, registry);

    const resume = makeFiberContinuation(fiber, reduction);
    fiber.next = makeResumeFiber(fiber, resume);
    fiber.path = [...fiber.path, 0];
  }

  inlineFiberCall(fiber, calls);
  mountFiberContinuation(fiber, use(fiber.next.f)(Next), 1);
}

// Detach a fiber by mounting a subcontext manually and delegating its execution
export const detachFiber = <F extends Function>(
  fiber: LiveFiber<F>,
) => {
  if (!fiber.args) return;
  let {host, next, args: [call, callback]} = fiber;

  pingFiber(fiber);

  if (!next || (next.f !== call.f)) next = fiber.next = makeSubFiber(fiber, call);
  next.args = call.args;

  callback(() => {
    if (next && host) {
      host.schedule(next, NOP);
      host.flush();
    }
  }, fiber.next);
}

// Dispose of a fiber's resources and all its mounted sub-fibers
export const disposeFiber = <F extends Function>(fiber: LiveFiber<F>) => {
  disposeFiberMounts(fiber);

  fiber.bound = undefined;
  if (fiber.host) fiber.host.dispose(fiber);
}

// Dispose of a fiber's mounted sub-fibers
export const disposeFiberMounts = <F extends Function>(fiber: LiveFiber<F>) => {
  const {mount, mounts, next, yeeted} = fiber;

  if (mount) disposeFiber(mount);
  if (mounts) for (const key of mounts.keys()) {
    const mount = mounts.get(key);
    if (mount) disposeFiber(mount);
  }
  if (next) disposeFiber(next);

  bustFiberYeet(fiber);
  visitYeetRoot(fiber);

  fiber.mount = fiber.mounts = fiber.next = null;
}

// Update a fiber in-place and recurse
export const updateMount = <P extends Function>(
  parent: LiveFiber<P>,
  mount?: LiveFiber<any> | null,
  newMount?: DeferredCall<any> | null,
  key?: Key,
): LiveFiber<any> | null | false => {
  const {host} = parent;

  const from = mount?.f;
  const to = newMount?.f;

  const update  = from && to;
  const replace = update && from !== to;

  if ((!to && from) || replace) {
    DEBUG && console.log('Unmounting', key, formatNode(mount!));
    if (host) host.__stats.unmounts++;
    if (!replace) return null;
  }

  if ((to && !from) || replace) {
    DEBUG && console.log('Mounting', key, formatNode(newMount!));
    if (host) host.__stats.mounts++;
    // Destroy yeet caches because trail of contexts downwards starts empty
    bustFiberYeet(parent, true);
    return makeSubFiber(parent, newMount!, newMount!.by ?? parent.id, key);
  }

  if (update) {
    if (mount!.args === newMount!.args && mount!.version) {
      DEBUG && console.log('Skipping', key, formatNode(newMount!));
      return false;
    }

    DEBUG && console.log('Updating', key, formatNode(newMount!));
    if (host) host.__stats.updates++;

    mount!.args = newMount!.args;

    return mount!;
  }

  return false;
}

// Flush dependent updates after adding / updating / removing a mount
export const flushMount = <F extends Function>(
  mount?: LiveFiber<F> | null,
  mounted?: LiveFiber<any> | null,
  fenced?: boolean,
) => {
  if (mounted && mounted !== mount) {
    disposeFiber(mounted);
  }
  if (mount) { 
    // Slice into new stack if too deep, or if fenced
    const {host} = mount;
    if (host && (fenced || host?.slice(mount))) return host.visit(mount);

    const element = renderFiber(mount);
    if (element !== undefined) updateFiber(mount, element);
  }
}

// Ensure a re-render of the associated yeet root
export const visitYeetRoot = <F extends Function>(
  fiber: LiveFiber<F>,
) => {
  const {host, yeeted} = fiber;
  if (fiber.type === YEET && yeeted) {
    const {root} = yeeted;

    DEBUG && console.log('Reduce', formatNode(fiber), '->', formatNode(root));
    bustFiberMemo(root);
    if (host) host.visit(root);
  }
}

// Remove a cached yeeted value and all upstream reductions
export const bustFiberYeet = <F extends Function>(fiber: LiveFiber<F>, force?: boolean) => {
  const {type, yeeted} = fiber;
  if ((fiber.type === YEET && yeeted) || (yeeted && force)) {
    let yt = yeeted;
    yt.value = undefined;

    if (force) yt.reduced = undefined;
    while ((yt = yt.parent!) && (yt.reduced !== undefined)) {
      yt.reduced = undefined;
    }
  }
}

// Force a memoized fiber to update next render
export const bustFiberMemo = <F extends Function>(fiber: LiveFiber<F>) => {
  if (fiber.version != null) fiber.version = incrementVersion(fiber.version);
}

// Cyclic version number that skips 0
export const incrementVersion = (v: number) => (((v + 1) | 0) >>> 0) || 1;
