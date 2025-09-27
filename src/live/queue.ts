import { LiveFiber, FiberQueue } from './types';
import { compareFibers } from './util';

type Q = {
  f: LiveFiber<any>
  next: Q | null,
};

// Priority queue that maintains fibers in tree order.
// Allows for quick append at head or tail.
//
// The queue is typically short and almost always first-in-first-out.
export const makeFiberQueue = (init?: LiveFiber<any>[]): FiberQueue => {
  
  let queue: Q | null = null;
  let tail: Q | null = null;

  const set = new Set<LiveFiber<any>>();

  const insert = (f: LiveFiber<any>) => {
    if (set.has(f)) return;
    set.add(f);

    if (!queue) {
      tail = queue = {f, next: null};
      return;
    }

    if (tail) {
      if (compareFibers(tail.f, f) < 0) {
        tail = tail.next = {f, next: null};
        return;
      }
    }

    if (compareFibers(queue.f, f) > 0) {
      queue = {f, next: queue};
      return;
    }

    let q = queue;
    while (q.next) {
      if (compareFibers(q.next.f, f) > 0) {
        q.next = {f, next: q.next};
        return;
      }
      q = q.next;
    }
  }

  const remove = (f: LiveFiber<any>) => {
    if (!queue) return;
    if (!set.has(f)) return;
    set.delete(f);

    let i = 0;
    if (queue.f === f) {
      queue = queue.next;
      if (!queue) tail = null;
      return;
    }

    let q = queue;
    while (q) {
      if (q.next?.f === f) {
        q.next = q.next.next;
        if (q.next == null) tail = q;
        return;
      }
      q = q.next as any;
    }
  }

  const all = () => {
    const out = [];
    let q = queue;
    while (q) {
      out.push(q.f);
      q = q.next;
    }
    return out;
  }

  const peek = (): LiveFiber<any> | null => {
    if (!queue) return null;
    return queue.f;
  }

  const pop = (): LiveFiber<any> | null => {
    if (!queue) return null;

    let q = queue;
    queue = queue.next;
    if (queue == null) tail = null;
    set.delete(q.f);

    return q.f;
  }

  if (init) for (let i of init) insert(i);

  return {insert, remove, all, peek, pop} as any;
}
