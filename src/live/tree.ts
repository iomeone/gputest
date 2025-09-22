import { Key, Action, Task, LiveFiber, DeferredCall, GroupedFibers, HostInterface, RenderCallbacks } from './types';

import { makeFiber, renderFiber, bustFiberCaches, visitYeetRoots } from './fiber';
import { makeActionScheduler, makeDependencyTracker, makeDisposalTracker, makePaintRequester, isSubOrSamePath, isSubPath, comparePaths } from './util';
import { formatNode } from './debug';

let DEBUG = false;
//setTimeout((() => DEBUG = false), 900);

const NO_ARGS = [] as any[];

export const makeHost = () => {
  const scheduler  = makeActionScheduler();
  const disposal   = makeDisposalTracker();
  const dependency = makeDependencyTracker();
  const host = {
    schedule: scheduler.schedule,
    track: disposal.track,
    dispose: disposal.dispose,
    depend: dependency.depend,
    undepend: dependency.undepend,
    invalidate: dependency.invalidate,
		__ping: () => {},
    __stats: {mounts: 0, unmounts: 0, updates: 0, dispatch: 0},
    __flush: scheduler.flush,
  } as HostInterface;
  return {host, scheduler, disposal, dependency};
}

export const makeHostFiber = <F extends Function>(node: DeferredCall<F>) => {
  const {host, scheduler, disposal, dependency} = makeHost();
  const fiber = makeFiber(node.f, host, null, node.args);
  return {fiber, host, scheduler, disposal, dependency};
}

export const renderWithDispatch = <T>(
  dispatch: (t: Task) => T,
) => <F extends Function>(node: DeferredCall<F>) => {
  DEBUG && console.log('Rendering Root', formatNode(node));

  const {fiber, host, scheduler} = makeHostFiber(node);

  const reenter = (as: Action<any>[]) => {
    dispatch(() => {
      const fibers = as.map(({fiber}) => fiber);
      DEBUG && console.log('----------------------------');
      DEBUG && console.log('Dispatch to Roots', fibers.map(formatNode));
      if (fibers.length) renderFibers(fibers);
    });
  };

  scheduler.bind(reenter);

  if (host) host.__stats.mounts++;
  return dispatch(() => renderFibers([fiber]));
}

export const renderFibers = (fibers: LiveFiber<any>[]) => {
  if (fibers.length === 1) {
    DEBUG && console.log('Dispatching Fiber', formatNode(fibers[0]));
    renderSubRoot(fibers[0], new Set());
  }
  else {
    // Filter to only the top-level roots
    // Gather sub-fibers that must have a visit
    const roots = groupFibers(fibers);
    DEBUG && console.log('Dispatching Fibers', roots.map((r) => formatNode(r.root)));
    for (let r of roots) renderSubRoot(r.root, r.subs);
  }
  return fibers.length > 1 ? fibers : fibers[0];
}

export const renderSubRoot = (
  root: LiveFiber<any>,
  subs: Set<LiveFiber<any>>,
) => {
  const {host} = root;
  if (host) host.__stats.dispatch++;

  const callbacks = makeRenderCallbacks(subs);

  // Update from the root down
  DEBUG && console.log('Updating Sub-Root', formatNode(root));
  renderFiber(root, callbacks);

  // Update any remaining shielded nodes
  while (subs.size) {
    const next = subs.values().next().value;
    DEBUG && console.log('Updating Memoized Sub-Node', formatNode(next));
    renderFiber(next, callbacks);
  }
}

// Group fibers by shared ancestry
export const groupFibers = (fibers: LiveFiber<any>[]) => {
  fibers.sort((a, b) => a.depth - b.depth);

  // Group to top-level roots and descendants
  const roots = [] as GroupedFibers[];
  nextFiber: for (let f of fibers) {
    for (let r of roots) if (isSubOrSamePath(r.root.path, f.path)) {
      r.subs.add(f);
      continue nextFiber;
    }
    roots.push({root: f, subs: new Set()});
  }
  roots.sort((a, b) => comparePaths(a.root.path, b.root.path));

  return roots;
}

const makeRenderCallbacks = (visit: Set<LiveFiber<any>>): RenderCallbacks => {
  const onRender = (fiber: LiveFiber<any>) => {
    // Remove from to-visit set
    if (visit) visit.delete(fiber);
  };

  const onUpdate = (fiber: LiveFiber<any>) => {
    // Bust far caches
    const {host} = fiber;
    if (host) for (let sub of host.invalidate(fiber)) {
      DEBUG && console.log('Invalidating Node', formatNode(sub));
      visit.add(sub);
      bustFiberCaches(sub);
      visitYeetRoots(visit, sub);
    }

  	// Notify host / dev tool of update
  	if (host?.__ping) host.__ping(fiber);
  };

  const onFence = (fiber: LiveFiber<any>) => {
    if (!visit.size) return;

    // Continuation fence
    // Ensure all child nodes of the fiber are rendered,
    // before calling/resuming its continuation.
    DEBUG && console.log('Fencing Sub-Root', formatNode(fiber));
    const nodes = [];
    const {path} = fiber;
    const before = [...path, 0];
    for (let f of visit.values()) if (isSubPath(before, f.path)) nodes.push(f);
    if (nodes.length) {
      renderFibers(nodes);
      for (let n of nodes) visit.delete(n);
    }
  }

  return {onRender, onUpdate, onFence};
}

export const renderPaint = (() => {
  const onPaint = makePaintRequester();
  return <F extends Function>(node: DeferredCall<F>) => {
    return new Promise((resolve) => {
      onPaint(() => resolve(renderSync(node)));
    });
  };
})();

export const renderSync = renderWithDispatch<LiveFiber<any>>((t: Task) => t() as any as LiveFiber<any>);
export const renderAsync = renderWithDispatch<void>((t: Task) => { setTimeout(t, 0); });
export const render = renderPaint;
