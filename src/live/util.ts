import { LiveFiber, Task, Action, Dispatcher, Key, ArrowFunction } from './types';

const RAF = typeof window !== 'undefined' ? window.requestAnimationFrame : setTimeout;
const NO_DEPS = [] as any[];

// Schedules actions to be run immediately after the current thread completes
export const makeActionScheduler = () => {
  const queue = [] as Action<any>[];

  let timer = null as any;
  let onUpdate = null as any;

  const bind = (f: Dispatcher) => onUpdate = f;

  const schedule = (fiber: LiveFiber<any>, task: Task) => {
    queue.push({fiber, task});
    if (!timer) timer = setTimeout(flush, 0);
  };

  const flush = () => {
    const q = queue.slice();
    queue.length = 0;
    timer = null;

    for (const {task} of q) task();
    if (onUpdate) {
      onUpdate(q);
    }
  };

  return {bind, schedule, flush};
}

// Tracks long-range dependencies for contexts
export const makeDependencyTracker = () => {
  const dependencies = new WeakMap<LiveFiber<any>, Set<LiveFiber<any>>>();

  const depend = (fiber: LiveFiber<any>, root: LiveFiber<any>) => {
    let list = dependencies.get(root);
    if (!list) dependencies.set(root, list = new Set());

    let exist = list.has(fiber);
    if (!exist) list.add(fiber);
    return !exist;
  }

  const undepend = (fiber: LiveFiber<any>, root: LiveFiber<any>) => {
    let list = dependencies.get(root);
    if (list) list.delete(fiber);
  }

  const invalidate = (fiber: LiveFiber<any>) => {
    const fibers = dependencies.get(fiber);
    return fibers ? Array.from(fibers.values()) : NO_DEPS;
  }

  return {depend, undepend, invalidate};
}


// Schedules actions to be run when an object is disposed of
export const makeDisposalTracker = () => {
  const disposal = new WeakMap<LiveFiber<any>, Task[]>();

  const track = (fiber: LiveFiber<any>, t: Task) => {
    let list = disposal.get(fiber);
    if (!list) disposal.set(fiber, list = []);
    list.push(t);
  }

  const dispose = (fiber: LiveFiber<any>) => {
    const tasks = disposal.get(fiber);
    if (tasks) {
      disposal.delete(fiber);
      for (const task of tasks) task();
    }
  }

  return {track, dispose};
}

// Schedules callback(s) on next paint
export const makePaintRequester = (raf: any = RAF) => {
  let pending = false;
  const queue: Task[] = [];

  const flush = () => {
    const q = queue.slice();
    queue.length = 0;
    pending = false;

    for (const t of q) t();
  }

  return (t: Task) => {
    if (!pending) {
      pending = true;
      raf(flush);
    }
    queue.push(t);
  }
}

// Compares dependency arrays
export const isSameDependencies = (
  prev: any[] | undefined,
  next: any[] | undefined,
) => {
  let valid = true;
  if (next === undefined && prev === undefined) return true;
  if (prev === undefined) valid = false;
  if (next != null && prev != null) {
    const n = prev.length || 0;
    if (n !== next.length || 0) valid = false;
    else for (let i = 0; i < n; ++i) if (prev[i] !== next[i]) {
      valid = false;
      break;
    }
  }
  return valid;
}

// Checks if B is a subnode of A
export const isSubNode = (a: LiveFiber<any>, b: LiveFiber<any>) => {
  const ak = a.path;
  const bk = b.path;

  if (ak.length > bk.length) return false;
  if (a.depth >= b.depth) return false;

  const n = ak.length;
  for (let i = 0; i < n; ++i) if (ak[i] !== bk[i]) return false;

  return (bk.length > ak.length) || (b.depth > a.depth);
}

// Sorting comparison of two fibers in depth-first tree order
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
      const v = (ai as string) < (bi as string) ? -1 : 1;
      if (v) return v;
      continue;
    }
  }

  return (ak.length - bk.length) || (a.depth - b.depth);
}

export const tagFunction = <F extends ArrowFunction>(f: F) => {
  (f as any).displayName = `${Math.floor(Math.random() * 10000)}`;
  return f;
}
