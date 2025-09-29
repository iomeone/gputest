import type { LiveFiber, FiberQueue } from './types';
import { compareFibers, isSubNode } from './util';
import { formatNodeName } from './debug';

type Q = {
  fiber: LiveFiber<any>
  next: Q | null,
};

// Priority queue that maintains fibers in tree order.
// Allows for quick append at head or tail, or right after last insertion.
//
// The queue is typically short and almost always first-in-first-out.
export const makeFiberQueue = (init?: LiveFiber<any>[]): FiberQueue => {

  let queue: Q | null = null;
  let tail: Q | null = null;
  let hint: Q | null = null;

  const set = new Set<LiveFiber<any>>();

  // Insert fiber into queue
  const insert = (fiber: LiveFiber<any>) => {
    if (set.has(fiber)) return;
    set.add(fiber);
    
    // Empty
    if (!queue) {
      tail = queue = {fiber, next: null};
      return;
    }

    // Append
    if (tail) {
      if (compareFibers(tail.fiber, fiber) <= 0) {
        tail = tail.next = {fiber, next: null};
        return;
      }
    }

    // Prepend
    if (compareFibers(queue.fiber, fiber) >= 0) {
      queue = {fiber, next: queue};
      return;
    }

    if (!queue.next) return;

    // Skip ahead
    let q = queue;
    if (hint && compareFibers(hint.fiber, fiber) <= 0) {
      q = hint;
    }

    // Iterate
    while (q.next) {
      if (compareFibers(q.next.fiber, fiber) >= 0) {
        q.next = {fiber, next: q.next};
        hint = q;
        return;
      }
      q = q.next;
    }
  }

  // Remove fiber from queue
  const remove = (fiber: LiveFiber<any>) => {
    if (!queue) return;
    if (!set.has(fiber)) return;
    set.delete(fiber);

    // Pop
    let i = 0;
    if (queue.fiber === fiber) {
      if (hint === queue) hint = hint.next;

      queue = queue.next;
      if (!queue) tail = null;

      return;
    }

    let q = queue;
    while (q.next) {
      const qn = q.next;
      if (qn.fiber === fiber) {
        if (hint === qn) hint = hint.next;
        q.next = qn.next;
        if (!q.next) tail = q;
        return;
      }
      q = q.next;
    }
  }
  
  // Re-insert all fibers that descend from fiber
  const reorder = (fiber: LiveFiber<any>) => {
    const list: LiveFiber<any>[] = [];

    const {path} = fiber;
    let q = queue;
    let qp = null;

    while (q) {
      if (compareFibers(fiber, q.fiber) >= 0) {
        hint = qp = q;
        q = q.next;
        continue;
      }
      if (isSubNode(fiber, q.fiber)) {
        list.push(q.fiber);
        if (qp) {
          qp.next = q.next;
          q = q.next;
        }
        else {
          pop();
          q = q.next;
        }
      }
      break;
    }

    if (list.length) {
      list.sort(compareFibers);
      list.forEach(insert);
    }
  };

  // Return entire queue (debug)
  const all = () => {
    const out = [];
    let q = queue;
    while (q) {
      out.push(q.fiber);
      q = q.next;
    }
    return out;
  }

  // Return top of queue
  const peek = (): LiveFiber<any> | null => {
    if (!queue) return null;
    return queue.fiber;
  }

  // Pop top of queue
  const pop = (): LiveFiber<any> | null => {
    if (!queue) return null;

    let q = queue;
    queue = q.next;

    if (hint === q) hint = hint.next;
    if (!queue) tail = null;

    set.delete(q.fiber);

    return q.fiber;
  }

  if (init) for (let i of init) insert(i);

  return {insert, remove, reorder, all, peek, pop} as any;
}
