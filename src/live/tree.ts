import type { Task, LiveFiber, LiveNode, DeferredCall, HostInterface, RenderOptions, ArrowFunction } from './types';

import { makeFiber, renderFiber, updateFiber, disposeFiber, reactInterop } from './fiber';
import { makeActionScheduler, makeDependencyTracker, makeDisposalTracker, makeStackSlicer, getOnPaint } from './util';
import { makeFiberQueue } from './queue';
import { LOGGING, formatNode } from './debug';
import { use, morph } from './builtin';

const DEFAULT_RENDER_OPTIONS = {
  stackSliceDepth: 20,
  strictQueueOrder: true,
  strictSliceOrder: true,
};

const START = +new Date();

const NO_NODE = () => null;

// Create new runtime host
export const makeHost = (
  options: RenderOptions = DEFAULT_RENDER_OPTIONS,
  dispatch: (t: Task) => void,
  flush: (fs: LiveFiber<any>[]) => void,
) => {
  const {
    stackSliceDepth,
    strictQueueOrder,
    strictSliceOrder,
  } = {...DEFAULT_RENDER_OPTIONS, ...options};

  const scheduler  = makeActionScheduler(dispatch, flush);
  const disposal   = makeDisposalTracker();
  const dependency = makeDependencyTracker();
  const queue      = makeFiberQueue();
  const slicer     = makeStackSlicer(stackSliceDepth, strictSliceOrder);

  let ID = 0;

  const host = {
    schedule: scheduler.schedule,
    flush: scheduler.flush,

    track: disposal.track,
    untrack: disposal.untrack,
    dispose: disposal.dispose,

    depend: dependency.depend,
    undepend: dependency.undepend,
    traceDown: dependency.traceDown,
    traceUp: dependency.traceUp,

    visit: queue.insert,
    unvisit: queue.remove,
    pop: queue.pop,
    peek: queue.peek,
    reorder: strictQueueOrder ? queue.reorder : () => {},
    all: queue.all,

    depth: slicer.depth,
    slice: slicer.slice,

    id: () => ++ID,
    options,

    __ping: () => {},
    __highlight: () => {},
    __stats: {mounts: 0, unmounts: 0, updates: 0, dispatch: 0},
  } as HostInterface;

  return {host, scheduler, disposal, dependency};
}

// Create top-most fiber with a new host
export const makeHostFiber = (
  node: DeferredCall<any>,
  options: RenderOptions = DEFAULT_RENDER_OPTIONS,
  dispatch: (t: Task) => void,
  flush: (fibers: LiveFiber<any>[]) => void,
) => {
  const {host, scheduler, disposal, dependency} = makeHost(options, dispatch, flush);
  const fiber = makeFiber(node.f, host, null, node.args);
  return {fiber, host, scheduler, disposal, dependency};
}

// Resolve a LiveElement root to a call
export const resolveRootNode = (children: LiveNode<any>): DeferredCall<any> => {
  const c = reactInterop(children);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  if (Array.isArray(c)) return morph(use(() => c))!;
  if (typeof c === 'string') return use(NO_NODE);
  if (typeof c === 'function') return use(c);
  return c ?? use(NO_NODE);
}

// Rendering entry point
export const renderWithDispatch = (
  dispatch?: (t: Task) => void,
) => <F extends ArrowFunction>(
  calls: LiveNode<F>,
  fiber?: LiveFiber<any> | null,
  options: RenderOptions = DEFAULT_RENDER_OPTIONS,
) => {
  const LOG = LOGGING.dispatch;
  const node = resolveRootNode(calls);

  let host: HostInterface | null = null;
  if (!fiber) {
    LOG && console.log('Rendering Root', formatNode(node));

    // Set up batched flush for all actions
    const flush = (fibers: LiveFiber<any>[]) => {
      (LOG || LOGGING.tick) && console.log('----------------------------');
      LOG && console.log('Dispatch to Roots', fibers.map(formatNode), +new Date() - START, 'ms');
      // eslint-disable-next-line no-debugger
      if (!fibers.length) debugger;

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (fibers.length) renderFibers(host!, fibers);
    };

    // Make new root
    ({fiber, host} = makeHostFiber(node, options, dispatch ?? queueMicrotask, flush));

    host.__stats.mounts++;
  }
  else if (fiber.host) {
    host = fiber.host;

    if (fiber.f !== node.f) {
      // Dispose and return new root
      LOG && console.log('Replacing Root', formatNode(node));
      disposeFiber(fiber);
      fiber = makeFiber(node.f, host, null, node.args);
    }
    else {
      // Update existing root
      LOG && console.log('Updating Root', formatNode(node));
      fiber.args = node.args;
    }

    host.__stats.updates++;
  }

  if (host) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (dispatch) dispatch(() => renderFibers(host!, [fiber!]));
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    else renderFibers(host!, [fiber!]);
  }

  return fiber;
}

// Render a list of updated fibers as one batch
export const renderFibers = (
  host: HostInterface,
  fibers: LiveFiber<any>[],
): LiveFiber<any>[] => {
  const LOG = LOGGING.dispatch;

  for (const f of fibers) host.visit(f);
  while (host.peek()) {
    const fiber = host.pop();
    if (!fiber) break;

    host.depth(fiber.depth);
    host.__stats.dispatch++;

    LOG && console.log(`Next Sub-Root #${fiber.id}`, formatNode(fiber));

    const element = renderFiber(fiber);
    updateFiber(fiber, element);
  }

  return fibers;
}

// Traverse over fiber and subfiber in render order
export const traverseFiber = (fiber: LiveFiber<any>, f: (f: LiveFiber<any>) => void) => {
  const {mount, mounts, next} = fiber;
  if (mount) traverseFiber(mount, f);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  if (mounts) for (const k of mounts.keys()) traverseFiber(mounts.get(k)!, f);
  if (next) traverseFiber(next, f);
}

const onPaint = getOnPaint();

// Render sync/async/onPaint
export const renderSync = renderWithDispatch();
export const renderAsync = renderWithDispatch((t: Task) => { setTimeout(t, 0); });
export const renderOnPaint = renderWithDispatch((t: Task) => { onPaint(t); });

export const render = renderSync;
export const unmount = (fiber: LiveFiber<any>) => disposeFiber(fiber);
