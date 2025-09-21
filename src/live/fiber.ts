import {
  HostInterface, LiveFiber, LiveFunction, LiveContext, LiveElement,
  FiberYeet, FiberContext, ContextValues, ContextRoots,
  OnFiber, DeferredCall, Key,
} from './types';

import { use, bind, reconcile, DETACH, RECONCILE, MAP_REDUCE, GATHER, YEET, PROVIDE } from './live';
import { isSameDependencies } from './util';
import { formatNode } from './debug';

let ID = 0;
let DEBUG = true;
//setTimeout((() => DEBUG = false), 900);

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

  const yeeted = parent?.yeeted ? {...parent.yeeted, parent: parent.yeeted} : null;
  const context = parent?.context ?? NO_CONTEXT;

  let path = parent ? parent.path : ROOT_PATH;
  if (key != null) path = [...path, key];

  const self = {
    bound, f, args,
    host, depth, path,
    yeeted, context,
    state: null, pointer: 0, version: null, memo: null,
    mount: null, mounts: null, next: null, seen: null,
    type: null, id: ++ID,
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
  const fiber = makeFiber(node.f, host, parent, node.args) as LiveFiber<F>;
  return fiber;
}

// Make fiber yeet state
export const makeYeetState = <F extends Function, A, B>(
  fiber: LiveFiber<F>,
  map?: (a: A) => B,
  roots?: LiveFiber<any>[],
): FiberYeet<B> => ({
  emit: map
    ? (fiber: LiveFiber<any>, v: A) => fiber.yeeted!.value = map(v)
    : (fiber: LiveFiber<any>, v: B) => fiber.yeeted!.value = v,
  value: undefined,
  reduced: undefined,
  parent: undefined,
  roots: roots ? [...roots, fiber] : [fiber],
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

  return {values, roots};
};

// Render a fiber
export const renderFiber = <F extends Function>(
  fiber: LiveFiber<F>,
  onRender?: OnFiber,
  onFence?: OnFiber,
) => {
  const {f, bound, args, yeeted} = fiber;

  // Let host do its thing
  if (onRender) onRender(fiber);

  // Disposed fiber, ignore
  if (!bound) return;

  let out: LiveElement<any>;
  // Passthrough built-ins
  if ((f as any).isLiveBuiltin) out = fiber as any as DeferredCall<any>;
  // Render live function
  else out = bound.apply(null, args ?? EMPTY_ARRAY);

  // Early exit if memoized
  if (fiber.version && fiber.type !== YEET && !fiber.next) {
    if (fiber.version === fiber.memo) return fiber;
    fiber.memo = fiber.version;
  }

  // Handle call and call[]
  let call = out as DeferredCall<any> | null;
  const isArray = !!out && Array.isArray(out);
  const fiberType = isArray ? Array : call?.f;

  // If fiber type changed, remount everything
  if (fiber.type && fiberType !== fiber.type) disposeFiberMounts(fiber);
  fiber.type = fiberType as any;

  // Reconcile literal array
  if (isArray) {
    const calls = out as DeferredCall<any>[];
    reconcileFiberCalls(fiber, calls, onRender, onFence);
  }
  // Reconcile wrapped array
  else if (fiberType === RECONCILE) {
    const calls = call!.args ?? EMPTY_ARRAY;
    reconcileFiberCalls(fiber, calls, onRender, onFence);
  }
  // Map reduce
  else if (fiberType === MAP_REDUCE) {
    const [calls, map, reduce, done] = call!.args ?? EMPTY_ARRAY;
    mapReduceFiberCalls(fiber, calls, map, reduce, done, onRender, onFence);
  }
  // Gather reduce
  else if (fiberType === GATHER) {
    const [calls, done] = call!.args ?? EMPTY_ARRAY;
    gatherFiberCalls(fiber, calls, done, onRender, onFence);
  }
  // Yeet value upstream
  else if (fiberType === YEET) {
    if (!yeeted) throw new Error("Yeet without aggregator");
    yeeted.emit(fiber, call!.arg);
  }
  // Mount normal node (may still be built-in)
  else {
    mountFiberCall(fiber, call, onRender, onFence);
  }

  return fiber;
}

// Mount one call on a fiber
export const mountFiberCall = <F extends Function>(
  fiber: LiveFiber<F>,
  call?: DeferredCall<any> | null,
  onRender?: OnFiber,
  onFence?: OnFiber,
) => {
  const {mount} = fiber;

  const nextMount = updateMount(fiber, mount, call);
  if (nextMount !== false) {
    fiber.mount = nextMount;
    flushMount(nextMount, mount, onRender, onFence);
  }
}

// Mount a continuation on a fiber
export const mountFiberContinuation = <F extends Function>(
  fiber: LiveFiber<F>,
  call: DeferredCall<any> | null,
  key?: Key,
  onRender?: OnFiber,
  onFence?: OnFiber,
) => {
  const {next} = fiber;
  const nextMount = updateMount(fiber, next, call, key);
  if (nextMount !== false) {
    fiber.next = nextMount;
    flushMount(nextMount, next, onRender, onFence);
  }
}

// Reconcile multiple calls on a fiber
export const reconcileFiberCalls = <F extends Function>(
  fiber: LiveFiber<F>,
  calls: DeferredCall<any>[],
  onRender?: OnFiber,
  onFence?: OnFiber,
) => {
  let {mounts, order, seen} = fiber;

  if (!mounts) mounts = fiber.mounts = new Map();
  if (!order)  order  = fiber.order  = [];
  if (!seen)   seen   = fiber.seen   = new Set();

  if (!Array.isArray(calls)) calls = [calls];

  order.length = 0;
  let i = 0, j = 0;
  for (let call of calls) {
    let key = call.key ?? i++;
    seen.add(key);
    order[j++] = key;

    // Array shorthand for nested reconciling
    if (Array.isArray(call)) call = reconcile(call as any, key);

    const mount = mounts.get(key);
    const nextMount = updateMount(fiber, mount, call, key);
    if (nextMount !== false) {
      if (nextMount) mounts.set(key, nextMount);
      else mounts.delete(key);
      flushMount(nextMount, mount, onRender, onFence);
    }
  }

  for (let key of mounts.keys()) if (!seen.has(key)) {
    const mount = mounts.get(key);
    updateMount(fiber, mount, null);
    mounts.delete(key);
    flushMount(null, mount, onRender, onFence);
  }

  seen.clear();
}

// Map-reduce a fiber
export const mapReduceFiberCalls = <F extends Function, R, T>(
  fiber: LiveFiber<F>,
  calls: DeferredCall<any>[],
  mapper: (t: T) => R,
  reducer: (a: R, b: R) => R,
  next?: LiveFunction<any>,
  onRender?: OnFiber,
  onFence?: OnFiber,
) => {
  let {yeeted} = fiber;
  if (!yeeted || yeeted.parent) {
    yeeted = fiber.yeeted = makeYeetState(fiber, mapper, yeeted?.roots);
    fiber.path.push(0);
  }

  reconcileFiberCalls(fiber, calls, onRender, onFence);
  if (onFence) onFence(fiber);

  const value = reduceFiberValues(fiber, reducer, true);
  if (next) mountFiberContinuation(fiber, use(next)(value), 1, onRender, onFence);
}

// Gather-reduce a fiber
export const gatherFiberCalls = <F extends Function, R, T>(
  fiber: LiveFiber<F>,
  calls: DeferredCall<any>[],
  next?: LiveFunction<any>,
  onRender?: OnFiber,
  onFence?: OnFiber,
) => {
  let {yeeted} = fiber;
  if (!yeeted || yeeted.parent) {
    yeeted = fiber.yeeted = makeYeetState(fiber, undefined, yeeted?.roots);
    fiber.path.push(0);
  }

  reconcileFiberCalls(fiber, calls, onRender, onFence);
  if (onFence) onFence(fiber);

  const value = gatherFiberValues(fiber, true);
  if (next) mountFiberContinuation(fiber, use(next)(value), 1, onRender, onFence);
}

// Reduce yeeted values on a tree of fibers
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
        value = reducer(value!, reduceFiberValues(m!, reducer)!);
      }
      return yeeted.reduced = value;
    }
  }
  else if (mount) return yeeted.reduced = reduceFiberValues(mount, reducer);
  return undefined;
}

// Reduce yeeted values on a tree of fibers
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
        const value = gatherFiberValues(m!);
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

// Provide a value for a context on a fiber
export const provideFiber = <F extends Function>(
  fiber: LiveFiber<F>,
  onRender?: OnFiber,
  onFence?: OnFiber,
) => {
  if (!fiber.args) return;
  let {args: [context, value, calls]} = fiber;

  if (fiber.context.roots.get(context) !== fiber) {
    fiber.context = makeContextState(fiber, fiber.context, context, value);
  }
  fiber.context.values.set(context, value);

  if (onRender) onRender(fiber);

  if (Array.isArray(calls)) reconcileFiberCalls(fiber, calls, onRender, onFence);
  else mountFiberCall(fiber, calls, onRender, onFence);
}

// Detach a fiber by mounting a subcontext manually and delegating its execution
export const detachFiber = <F extends Function>(
  fiber: LiveFiber<F>,
  onRender?: OnFiber,
  onFence?: OnFiber,
) => {
  if (!fiber.args) return;
  let {mount, args: [call, callback]} = fiber;

  if (!mount || (mount.f !== call.f)) mount = fiber.mount = makeSubFiber(fiber, call);
  mount.args = call.args;

  callback(() => renderFiber(mount!, onRender, onFence), mount);
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
  key: Key = 0,
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
  onRender?: OnFiber,
  onFence?: OnFiber,
) => {
  if (mounted && mounted !== mount) {
    disposeFiber(mounted);
  }
  if (mount) { 
    // @ts-ignore
    if (mount.f === DETACH) detachFiber(mount, onRender, onFence);
    // @ts-ignore
    else if (mount.f === PROVIDE) provideFiber(mount, onRender, onFence);
    else renderFiber(mount, onRender, onFence);
  }
}

// Bust caches for a fiber when state changes
export const bustCaches = <F extends Function>(fiber: LiveFiber<F>) => {
  const {host, version, yeeted} = fiber;
  if (version != null) fiber.version++;
  if (yeeted) {
    let yt = yeeted;
    do { yt.value = yt.reduced = undefined } while (yt = yt.parent!);
    if (host) for (let root of yeeted.roots) host.schedule(root, NOP);
  }
}
