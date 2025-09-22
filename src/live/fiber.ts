import {
  HostInterface, LiveFiber, LiveFunction, LiveContext, LiveElement,
  FiberYeet, FiberContext, ContextValues, ContextRoots,
  OnFiber, DeferredCall, Key, RenderCallbacks,
} from './types';

import { use, bind, reconcile, DETACH, RECONCILE, MAP_REDUCE, GATHER, MULTI_GATHER, YEET, PROVIDE, CONSUME } from './live';
import { renderFibers } from './tree';
import { isSameDependencies } from './util';
import { formatNode } from './debug';

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

// Make a fiber for a live function
export const makeFiber = <F extends Function>(
  f: LiveFunction<F>,
  host?: HostInterface | null,
  parent?: LiveFiber<any> | null,
  args?: any[],
  key?: Key,
): LiveFiber<F> => {
  const bound = null;
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
    mount: null, mounts: null, next: null, seen: null,
    type: null, id,
  } as any as LiveFiber<F>;

  self.bound = bind(f, self) as any as F;

  return self;
};

// Prepare a new sub fiber for continued rendering
export const makeSubFiber = <F extends Function>(
  parent: LiveFiber<any>,
  node: DeferredCall<F>,
  key?: Key,
): LiveFiber<F> => {
  const {host} = parent;
  const fiber = makeFiber(node.f, host, parent, node.args, key) as LiveFiber<F>;
  return fiber;
}

// Make a resume continuation for a fiber
export const makeResumeFiber = <F extends Function>(
  fiber: LiveFiber<F>,
  handler: Function,
  next?: LiveFunction<any>,
): LiveFiber<any> => {
  const Resume = () => handler;
  Resume.displayName = `Resume(${(next as any)?.displayName ?? ''})`;

  const nextFiber = makeSubFiber(fiber, use(Resume)(), 1);

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
  roots?: LiveFiber<any>[],
): FiberYeet<B> => ({
  id: fiber.id,
  emit: map
    ? (fiber: LiveFiber<any>, v: A) => fiber.yeeted!.value = map(v)
    : (fiber: LiveFiber<any>, v: B) => fiber.yeeted!.value = v,
  value: undefined,
  reduced: undefined,
  parent: undefined,
  roots: roots ? [...roots, nextFiber] : [nextFiber],
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
  values.set(context, { current: value });
  
  return {values, roots};
};

// Render a fiber
export const renderFiber = <F extends Function>(
  fiber: LiveFiber<F>,
  callbacks?: RenderCallbacks,
) => {
  const {f, bound, args, yeeted} = fiber;

  // Let host do its thing
  if (callbacks) if (!callbacks.onRender(fiber)) return;

  // Disposed fiber, ignore
  if (!bound) return;

  let element: LiveElement<any>;
  // Passthrough built-ins

  if ((f as any).isLiveBuiltin) element = fiber as any as DeferredCall<any>;
  // Render live function
  else element = bound.apply(null, args ?? EMPTY_ARRAY);

  // Early exit if memoized and same result
  if (fiber.version && !fiber.next && fiber.type !== YEET) {
    if (fiber.version === fiber.memo) return fiber;
    fiber.memo = fiber.version;
  }

  // Let host do its thing
  //
  // Call this here instead of in updateFiber
  // so that collapsed provide+gather nodes don't update twice.
  if (callbacks) {
    callbacks.onUpdate(fiber);
  }

  // Apply rendered result
  updateFiber(fiber, element, callbacks);
}

// Update a fiber with rendered result
export const updateFiber = <F extends Function>(
  fiber: LiveFiber<F>,
  element: LiveElement<any>,
  callbacks?: RenderCallbacks,
) => {
  const {f, bound, args, yeeted} = fiber;

  // Handle call and call[]
  let call = element as DeferredCall<any> | null;
  const isArray = !!element && Array.isArray(element);
  const fiberType = isArray ? Array : call?.f;

  // If fiber type changed, remount everything
  if (fiber.type && fiberType !== fiber.type) disposeFiberMounts(fiber);
  fiber.type = fiberType as any;

  // Reconcile literal array
  if (isArray) {
    const calls = element as DeferredCall<any>[];
    reconcileFiberCalls(fiber, calls, callbacks);
  }
  // Reconcile wrapped array
  else if (fiberType === RECONCILE) {
    const calls = call!.args ?? EMPTY_ARRAY;
    reconcileFiberCalls(fiber, calls, callbacks);
  }
  // Map reduce
  else if (fiberType === MAP_REDUCE) {
    const [calls, map, reduce, done] = call!.args ?? EMPTY_ARRAY;
    mapReduceFiberCalls(fiber, calls, map, reduce, done, callbacks);
  }
  // Gather reduce
  else if (fiberType === GATHER) {
    const [calls, done] = call!.args ?? EMPTY_ARRAY;
    gatherFiberCalls(fiber, calls, done, callbacks);
  }
  // Multi-Gather reduce
  else if (fiberType === MULTI_GATHER) {
    const [calls, done] = call!.args ?? EMPTY_ARRAY;
    multiGatherFiberCalls(fiber, calls, done, callbacks);
  }
  // Yeet value upstream
  else if (fiberType === YEET) {
    if (!yeeted) throw new Error("Yeet without aggregator");
    yeeted.emit(fiber, call!.arg);
  }
  // Mount normal node (may still be built-in)
  else {
    mountFiberCall(fiber, call, callbacks);
  }

  return fiber;
}

// Mount one call on a fiber
export const mountFiberCall = <F extends Function>(
  fiber: LiveFiber<F>,
  call?: DeferredCall<any> | null,
  callbacks?: RenderCallbacks,
) => {
  const {mount} = fiber;
  const args = mount?.args;

  const nextMount = updateMount(fiber, mount, call);
  if (nextMount !== false) {
    fiber.mount = nextMount;
    flushMount(nextMount, mount, args, callbacks);
  }
}

// Mount a continuation on a fiber
export const mountFiberContinuation = <F extends Function>(
  fiber: LiveFiber<F>,
  call: DeferredCall<any> | null,
  key?: Key,
  callbacks?: RenderCallbacks,
) => {
  const {next} = fiber;
  const args = next?.args;

  const nextMount = updateMount(fiber, next, call, key);
  if (nextMount !== false) {
    fiber.next = nextMount;
    flushMount(nextMount, next, args, callbacks);
  }
}

// Reconcile multiple calls on a fiber
export const reconcileFiberCalls = <F extends Function>(
  fiber: LiveFiber<F>,
  calls: DeferredCall<any>[],
  callbacks?: RenderCallbacks,
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

    let key = call?.key ?? i;
    if (seen.has(key)) throw new Error(`Duplicate key ${key} while reconciling ` + formatNode(fiber));
    seen.add(key);
    order[i++] = key;

    // Array shorthand for nested reconciling
    if (Array.isArray(call)) call = reconcile(call as any, key);

    const mount = mounts.get(key);
    const args = mount?.args;

    const nextMount = updateMount(fiber, mount, call, key);
    if (nextMount !== false) {
      if (nextMount) mounts.set(key, nextMount);
      else mounts.delete(key);
      flushMount(nextMount, mount, args, callbacks);
    }
  }

  for (let key of mounts.keys()) if (!seen.has(key)) {
    const mount = mounts.get(key);
    const args = mount?.args;
    updateMount(fiber, mount, null);
    mounts.delete(key);
    flushMount(null, mount, args, callbacks);
  }

}

// Connect a live function as a continuation of a prior fiber
export const makeFiberContinuation = <F extends Function, R>(
  fiber: LiveFiber<F>,
  reduction: () => R,
) => (
  next?: LiveFunction<any>
) => {
  const value = reduction();

  // Bust cache on next fiber as it may immediately reduce
  if (fiber.next?.mount) bustFiberCaches(fiber.next.mount);
  // Next fiber may be inlined for efficiency
  else if (fiber.next) bustFiberCaches(fiber.next);
  if (!next) return null;

  // If mounting static component, inline into current fiber
  // @ts-ignore
  if (next.isStaticComponent) return next(fiber)(value);
  // Mount as new fiber
  else return use(next)(value);
}

// Generalized mounting of reduction-like continuations
export const mountFiberReduction = <F extends Function, R, T>(
  fiber: LiveFiber<F>,
  calls: DeferredCall<any>[],
  mapper: ((t: T) => R) | undefined,
  reduction: () => R,
  next?: LiveFunction<any>,
  callbacks?: RenderCallbacks,
) => {
  const {yeeted} = fiber;
  if (!fiber.next) {
    const resume = makeFiberContinuation(fiber, reduction);
    fiber.next = makeResumeFiber(fiber, resume, next);
    fiber.yeeted = makeYeetState(fiber, fiber.next, mapper, yeeted?.roots);
    fiber.path.push(0);
  }

  reconcileFiberCalls(fiber, calls, callbacks);
  if (callbacks) callbacks.onFence(fiber);

  const Resume = fiber.next.f;
  mountFiberContinuation(fiber, use(Resume)(next), 1, callbacks);
}

// Map-reduce a fiber
export const mapReduceFiberCalls = <F extends Function, R, T>(
  fiber: LiveFiber<F>,
  calls: DeferredCall<any>[],
  mapper: (t: T) => R,
  reducer: (a: R, b: R) => R,
  next?: LiveFunction<any>,
  callbacks?: RenderCallbacks,
) => {
  const reduction = () => reduceFiberValues(fiber, reducer, true);
  return mountFiberReduction(fiber, calls, mapper, reduction, next, callbacks);
}

// Gather-reduce a fiber
export const gatherFiberCalls = <F extends Function, R, T>(
  fiber: LiveFiber<F>,
  calls: DeferredCall<any>[],
  next?: LiveFunction<any>,
  callbacks?: RenderCallbacks,
) => {
  const reduction = () => gatherFiberValues(fiber, true);
  return mountFiberReduction(fiber, calls, undefined, reduction, next, callbacks);
}

// Multi-gather-reduce a fiber
export const multiGatherFiberCalls = <F extends Function, R, T>(
  fiber: LiveFiber<F>,
  calls: DeferredCall<any>[],
  next?: LiveFunction<any>,
  callbacks?: RenderCallbacks,
) => {
  const reduction = () => multiGatherFiberValues(fiber, true);
  return mountFiberReduction(fiber, calls, undefined, reduction, next, callbacks);
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

// Provide a value for a context on a fiber
export const provideFiber = <F extends Function>(
  fiber: LiveFiber<F>,
  prevArgs: any[],
  callbacks?: RenderCallbacks,
) => {
  if (!fiber.args) return;
  let {args: [context, value, calls, isMemo]} = fiber;
  let [,, prevCalls] = prevArgs ?? [];

  if (callbacks) if (!callbacks.onRender(fiber)) return;

  if (fiber.context.roots.get(context) !== fiber) {
    fiber.context = makeContextState(fiber, fiber.context, context, value);
    if (callbacks) callbacks.onUpdate(fiber);
  }
  else {
    // Set new value if changed
    const lastValue = fiber.context.values.get(context).current;
    if (value !== lastValue) {
      fiber.context.values.get(context).current = value;
      if (callbacks) callbacks.onUpdate(fiber);
    }
    // If memoized and mounts are identical, stop
    else if (isMemo && prevCalls === calls) return;
  }

  if (Array.isArray(calls)) reconcileFiberCalls(fiber, calls, callbacks);
  else {
    const call = calls;
    if (!isMemo && (call.f as any).isLiveInline) {
      updateFiber(fiber, call, callbacks);
    }
    else {
      mountFiberCall(fiber, calls, callbacks);
    }
  }
}

// Consume values from a co-context on a fiber
export const consumeFiber = <F extends Function>(
  fiber: LiveFiber<F>,
  callbacks?: RenderCallbacks,
) => {
  if (!fiber.args) return;
  let {args: [context, calls, done]} = fiber;

  if (callbacks) if (!callbacks.onRender(fiber)) return;

  if (!fiber.next) {
    const registry = new Map<LiveFiber<any>, any>();
    const reduction = () => registry;

    fiber.context = makeContextState(fiber, fiber.context, context, registry);
    if (callbacks) callbacks.onUpdate(fiber);

    const resume = makeFiberContinuation(fiber, reduction);
    fiber.next = makeResumeFiber(fiber, resume, done);
    fiber.path.push(0);
  }

  if (Array.isArray(calls)) reconcileFiberCalls(fiber, calls, callbacks);
  else {
    const call = calls;
    if ((call.f as any).isLiveInline) {
      updateFiber(fiber, call, callbacks);
    }
    else {
      mountFiberCall(fiber, calls, callbacks);
    }
  }

  if (callbacks) callbacks.onFence(fiber);

  const Resume = fiber.next.f;
  mountFiberContinuation(fiber, use(Resume)(done), 1, callbacks);
}

// Detach a fiber by mounting a subcontext manually and delegating its execution
export const detachFiber = <F extends Function>(
  fiber: LiveFiber<F>,
  callbacks?: RenderCallbacks,
) => {
  if (!fiber.args) return;
  let {next, args: [call, callback]} = fiber;

  if (!next || (next.f !== call.f)) next = fiber.next = makeSubFiber(fiber, call);
  next.args = call.args;

  if (callbacks) if (!callbacks.onRender(fiber)) return;

  const roots = [next];
  callback(() => {
    if (callbacks) callbacks.onUpdate(fiber);
    return renderFibers(roots);
  }, fiber.next);
}

// Dispose of a fiber's resources and all its mounted sub-fibers
export const disposeFiber = <F extends Function>(fiber: LiveFiber<F>) => {
  disposeFiberMounts(fiber);
  if (fiber.host) fiber.host.dispose(fiber);
}

// Dispose of a fiber's mounted sub-fibers
export const disposeFiberMounts = <F extends Function>(fiber: LiveFiber<F>) => {
  const {mount, mounts, next} = fiber;

  if (mount) disposeFiber(mount);
  if (mounts) for (const key of mounts.keys()) {
    const mount = mounts.get(key);
    if (mount) disposeFiber(mount);
  }
  if (next) disposeFiber(next);

  // @ts-ignore
  fiber.bound = fiber.mount = fiber.mounts = fiber.next = null;
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
    return makeSubFiber(parent, newMount!, key);
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
  prevArgs?: any[],
  callbacks?: RenderCallbacks,
) => {
  if (mounted && mounted !== mount) {
    disposeFiber(mounted);
  }
  if (mount) { 
    // @ts-ignore
    if (mount.f === PROVIDE) provideFiber(mount, prevArgs, callbacks);
    // @ts-ignore
    else if (mount.f === CONSUME) consumeFiber(mount, callbacks);
    // @ts-ignore
    else if (mount.f === DETACH) detachFiber(mount, callbacks);
    else renderFiber(mount, callbacks);
  }
}

// Bust caches for a fiber when state changes
export const bustFiberCaches = <F extends Function>(fiber: LiveFiber<F>) => {
  const {host, version, yeeted} = fiber;
  if (DEBUG && (version != null || yeeted)) console.log('Busting caches on', formatNode(fiber));
  if (version != null) {
    fiber.version = (fiber.version + 1) & 0x7FFFFFFF;
  }
  if (yeeted) {
    let yt = yeeted;
    do {
      yt.value = yt.reduced = undefined;
    } while (yt = yt.parent!);
  }
}

// Schedule a re-render of any associated yeet roots
export const scheduleYeetRoots = <F extends Function>(fiber: LiveFiber<F>) => {
  DEBUG && console.log('Rescheduling', formatNode(fiber));
  const {host, yeeted} = fiber;
  if (yeeted) {
    if (host) for (let root of yeeted.roots) host.schedule(root, NOP);
  }
}

// Schedule a re-render of any associated yeet roots
export const visitYeetRoots = <F extends Function>(visit: Set<LiveFiber<F>>, fiber: LiveFiber<F>, ) => {
  DEBUG && console.log('Revisiting', formatNode(fiber));
  const {yeeted} = fiber;
  if (yeeted) {
    for (let root of yeeted.roots) visit.add(root);
  }
}
