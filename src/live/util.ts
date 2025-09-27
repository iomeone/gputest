import type { LiveFiber, Task, Action, Dispatcher, Key, ArrowFunction } from './types';

const NO_DEPS = [] as any[];

/** Cyclic 32-bit version number that skips 0 */
export const incrementVersion = (v: number) => (((v + 1) | 0) >>> 0) || 1;

/** Schedules actions to be run immediately after the current thread completes.
Notifies the bound listener once after running all actions. */
export const makeActionScheduler = (
  request: (flush: ArrowFunction) => void,
  onFlush: (as: Action[]) => void,
) => {
  const queue = [] as Action[];

  let pending = false;

  const schedule = (fiber: LiveFiber<any>, task: Task) => {
    queue.push({fiber, task});
    if (!pending) {
      pending = true;
      request(flush);
    }
  };

  const flush = () => {
    if (!queue.length) return;

    const q = queue.slice();
    queue.length = 0;
    pending = false;

    for (const {task} of q) task();
    onFlush(q);
  };

  return {schedule, flush};
}

/** Tracks long-range dependencies for contexts */
export const makeDependencyTracker = () => {
  // Used in forward direction
  const dependencies = new WeakMap<LiveFiber<any>, Set<LiveFiber<any>>>();

  // Inspector-only, backward direction
  const precedents = new WeakMap<LiveFiber<any>, Set<LiveFiber<any>>>();

  const depend = (fiber: LiveFiber<any>, root: LiveFiber<any>) => {
    {
      let list = precedents.get(fiber);
      if (!list) precedents.set(fiber, list = new Set());

      let exist = list.has(root);
      if (!exist) list.add(root);
    }
    
    let list = dependencies.get(root);
    if (!list) dependencies.set(root, list = new Set());

    let exist = list.has(fiber);
    if (!exist) list.add(fiber);
    return !exist;
  }

  const undepend = (fiber: LiveFiber<any>, root: LiveFiber<any>) => {
    {
      let list = precedents.get(fiber);
      if (list) list.delete(root);
    }

    let list = dependencies.get(root);
    if (list) list.delete(fiber);
  }

  const traceDown = (fiber: LiveFiber<any>) => {
    const fibers = dependencies.get(fiber);
    return fibers ? fibers.values() : NO_DEPS;
  }

  const traceUp = (fiber: LiveFiber<any>) => {
    const fibers = precedents.get(fiber);
    return fibers ? fibers.values() : NO_DEPS;
  }

  return {depend, undepend, traceDown, traceUp};
}


/** Schedules actions to be run when an object is disposed of */
export const makeDisposalTracker = () => {
  const disposal = new WeakMap<LiveFiber<any>, Task[]>();

  const track = (fiber: LiveFiber<any>, t: Task) => {
    let list = disposal.get(fiber);
    if (!list) disposal.set(fiber, list = []);
    list.push(t);
  }

  const untrack = (fiber: LiveFiber<any>, t: Task) => {
    let list = disposal.get(fiber);
    if (!list) return;

    const i = list.indexOf(t);
    list.splice(i, 1);
  }

  const dispose = (fiber: LiveFiber<any>) => {
    const tasks = disposal.get(fiber);
    if (tasks) {
      disposal.delete(fiber);
      for (const task of tasks) task();
    }
  }

  return {track, untrack, dispose};
}

/** Node-friendly RAF wrapper */
export const getOnPaint = () => typeof window !== 'undefined' ? window.requestAnimationFrame : setTimeout;

/** Compare dependency arrays */
export const isSameDependencies = (
  prev: any[] | undefined,
  next: any[] | undefined,
) => {
  let valid = true;
  if (next === undefined && prev === undefined) return true;
  if (prev === undefined) valid = false;
  if (next != null && prev != null) {
    if (next === prev) return true;

    const n = prev.length || 0;
    if (n !== next.length || 0) valid = false;
    else for (let i = 0; i < n; ++i) if (prev[i] !== next[i]) {
      valid = false;
      break;
    }
  }
  return valid;
}

/** Check if B is a subnode of A */
export const isSubNode = (a: LiveFiber<any>, b: LiveFiber<any>) => {
  const ak = a.path;
  const bk = b.path;

  if (ak.length > bk.length) return false;
  if (a.depth >= b.depth) return false;

  const n = ak.length;
  for (let i = 0; i < n; ++i) if (ak[i] !== bk[i]) return false;

  return (bk.length > ak.length) || (b.depth > a.depth);
}

/** Compare of two fibers in depth-first tree order */
export const compareFibers = (a: LiveFiber<any>, b: LiveFiber<any>) => {
  const ak = a.path;
  const bk = b.path;
  
  const n = Math.min(ak.length, bk.length);
  for (let i = 0; i < n; ++i) {
    const ai = ak[i];
    const bi = bk[i];

    const an = typeof ai === 'number';
    const bn = typeof bi === 'number';
    if (an && bn) {
      const v = (ai as number) - (bi as number);
      if (v) return v;
      continue;
    }

    const at = typeof ai === 'string';
    const bt = typeof bi === 'string';
    if (at && bt) {
      const lt = (ai as string) < (bi as string);
      const gt = (ai as string) > (bi as string);
      const v = lt ? -1 : gt ? 1 : 0;
      if (v) return v;
      continue;
    }
    
    if (at && !bt) return 1;
    if (!at && bt) return -1;
  }

  return (ak.length - bk.length) || (a.depth - b.depth);
}

/** Tag an anonymous function with a random number ID. */
export const tagFunction = <F extends ArrowFunction>(f: F, name?: string) => {
  (f as any).displayName = name ?? `${Math.floor(Math.random() * 10000)}`;
  return f;
}

