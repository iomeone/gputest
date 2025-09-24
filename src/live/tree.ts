import { Key, Action, Task, LiveFiber, DeferredCall, FiberQueue, HostInterface, RenderCallbacks, RenderOptions } from './types';

import { makeFiber, renderFiber, updateFiber } from './fiber';
import { makeActionScheduler, makeDependencyTracker, makeDisposalTracker, makePaintRequester } from './util';
import { makeFiberQueue } from './queue';
import { formatNode } from './debug';

const DEFAULT_RENDER_OPTIONS = {
  stackSliceDepth: 20,
};

let DEBUG = false;
//setTimeout((() => DEBUG = false), 4000);

const NO_ARGS = [] as any[];
const dedupe = <T>(list: T[]): T[] => Array.from(new Set<T>(list));

// Create new runtime host
export const makeHost = (
  options: RenderOptions = DEFAULT_RENDER_OPTIONS,
) => {
  const scheduler  = makeActionScheduler();
  const disposal   = makeDisposalTracker();
  const dependency = makeDependencyTracker();
  const queue      = makeFiberQueue();

  let DEPTH = 0;
  const {stackSliceDepth} = options;
  const depth = (depth: number) => DEPTH = depth;
  const slice = (f: LiveFiber<any>) => f.depth - DEPTH > stackSliceDepth;

  const host = {
    schedule: scheduler.schedule,
    track: disposal.track,
    dispose: disposal.dispose,
    depend: dependency.depend,
    undepend: dependency.undepend,
    invalidate: dependency.invalidate,
    flush: scheduler.flush,

    visit: queue.insert,
    unvisit: queue.remove,
    pop: queue.pop,
    peek: queue.peek,

    depth,
    slice,

    options,

    __ping: () => {},
    __stats: {mounts: 0, unmounts: 0, updates: 0, dispatch: 0},
  } as HostInterface;

  return {host, scheduler, disposal, dependency};
}

// Create top-most fiber with a new host
export const makeHostFiber = <F extends Function>(
  node: DeferredCall<F>,
  renderOptions: RenderOptions = DEFAULT_RENDER_OPTIONS,
) => {
  const {host, scheduler, disposal, dependency} = makeHost(renderOptions);
  const fiber = makeFiber(node.f, host, null, node.args);
  return {fiber, host, scheduler, disposal, dependency};
}

// Rendering entry point
export const renderWithDispatch = <T>(
  dispatch: (t: Task) => T,
) => <F extends Function>(
  node: DeferredCall<F>,
  renderOptions: RenderOptions = DEFAULT_RENDER_OPTIONS,
) => {
  DEBUG && console.log('Rendering Root', formatNode(node));

  const {fiber, host, scheduler} = makeHostFiber(node, renderOptions);
  const reenter = (as: Action<any>[]) => {
    dispatch(() => {
      const fibers = dedupe(as.map(({fiber}) => fiber));

      DEBUG && console.log('----------------------------');
      DEBUG && console.log('Dispatch to Roots', fibers.map(formatNode));

      if (fibers.length) renderFibers(host, fibers);
    });
  };

  scheduler.bind(reenter);

  if (host) host.__stats.mounts++;
  return dispatch(() => renderFibers(host, [fiber])[0]);
}

// Render a list of updated fibers as one batch
export const renderFibers = (
  host: HostInterface,
  fibers: LiveFiber<any>[],
): LiveFiber<any>[] => {

  for (const f of fibers) host.visit(f);
  while (host.peek()) {
    const fiber = host.pop();
    if (!fiber) break;

    host.depth(fiber.depth);
    host.__stats.dispatch++;

    DEBUG && console.log('Next Sub-Root', formatNode(fiber));
    
    const element = renderFiber(fiber);
    updateFiber(fiber, element);
  }

  return fibers;
}

// Traverse over fiber and subfiber in render order
export const traverseFiber = (fiber: LiveFiber<any>, f: (f: LiveFiber<any>) => void) => {
  const {mount, mounts, next} = fiber;
  if (mount) traverseFiber(mount, f);
  if (mounts) for (const k of mounts.keys()) traverseFiber(mounts.get(k)!, f);
  if (next) traverseFiber(next, f);
}

// Render on next paint (animation frame)
export const renderPaint = (() => {
  const onPaint = makePaintRequester();
  return <F extends Function>(node: DeferredCall<F>) => {
    return new Promise((resolve) => {
      onPaint(() => resolve(renderSync(node)));
    });
  };
})();

// Render sync/async, immediately
export const renderSync = renderWithDispatch<LiveFiber<any>>((t: Task) => t() as any as LiveFiber<any>);
export const renderAsync = renderWithDispatch<void>((t: Task) => { setTimeout(t, 0); });
export const render = renderPaint;
