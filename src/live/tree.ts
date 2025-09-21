import { Key, Action, Task, LiveFiber, DeferredCall, GroupedFibers } from './types';

import { makeFiber, makeSubFiber, renderFiber, bustCaches } from './fiber';
import { makeActionScheduler, makeDependencyTracker, makeDisposalTracker, makePaintRequester, isSubOrSamePath, isSubPath } from './util';
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
  };
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
      if (fibers.length) renderFibers(fibers);
    });
  };

  scheduler.bind(reenter);

  if (host) host.__stats.mounts++;
  return dispatch(() => renderFibers([fiber]));
}

export const renderFibers = (fibers: LiveFiber<any>[]) => {
  // Filter to only the top-level roots
  // Gather sub-fibers that must have a visit
  const roots = groupFibers(fibers);
  for (let r of roots) renderSubRoot(r.root, r.subs);

  return fibers.length > 1 ? fibers : fibers[0];
}

export const renderSubRoot = (
  root: LiveFiber<any>,
  subs: Set<LiveFiber<any>>,
) => {
  const {host} = root;
  if (host) host.__stats.dispatch++;

  const onRender = makeOnRender(subs);

  const onFence = (fiber: LiveFiber<any>) => {
    // Fence
    DEBUG && console.log('Fencing Sub-Root', formatNode(fiber));
    const {path} = fiber;
    const nodes = Array.from(subs.values()).filter(f => isSubPath(path, f.path));
    if (nodes.length) {
      renderFibers(nodes);
      for (let n of nodes) subs.delete(n);
    }
  }

  DEBUG && console.log('Updating Sub-Root', formatNode(root));
  renderFiber(root, onRender, onFence);

  // Update remaining fenced nodes
  while (subs.size) {
    const next = subs.values().next().value;
    DEBUG && console.log('Updating Memoized Sub-Node', formatNode(next));
    renderFiber(next, onRender, onFence);
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

  return roots;
}

const makeOnRender = (visit: Set<LiveFiber<any>>) => (fiber: LiveFiber<any>) => {
  // Remove from to-visit set
  if (visit) visit.delete(fiber);

  // Bust far caches
  const {host} = fiber;
  if (host) for (let sub of host.invalidate(fiber)) {
    DEBUG && console.log('Invalidating Node', formatNode(sub));
    visit.add(sub);
    bustCaches(sub);
  }

	// Notify host / dev tool of render
	host.__ping(fiber);
};

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
