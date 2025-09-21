import { Key, Action, Task, LiveContext, DeferredCall } from './types';
import { makeContext, makeSubContext, FORK_NODE } from './live';
import { formatNode } from './debug';
import { makeActionScheduler, makeDisposalTracker, makePaintRequester } from './util';

let DEBUG = false;
//setTimeout((() => DEBUG = false), 900);

const NO_ARGS = [] as any[];

export const makeHost = () => {
  const scheduler = makeActionScheduler();
  const tracker = makeDisposalTracker();
  const host = {
    schedule: scheduler.schedule,
    track: tracker.track,
    dispose: tracker.dispose,
    __stats: {mounts: 0, unmounts: 0, updates: 0},
    __flush: scheduler.flush,
  };
  return {host, scheduler, tracker};
}

export const makeHostContext = <F extends Function>(node: DeferredCall<F>) => {
  const {host, scheduler, tracker} = makeHost();
  const context = makeContext(node.f, host, null, node.args);
  return {context, host, scheduler, tracker};
}

export const renderWithDispatch = <T>(
  dispatch: (t: Task) => T,
) => <F extends Function>(node: DeferredCall<F>) => {
  let generation = 1;

  DEBUG && console.log('Rendering Root', formatNode(node));

  const {context, host, scheduler} = makeHostContext(node);

  const reenter = (as: Action[]) => {
    dispatch(() => {
      generation++;

      const ctxs = as.map(({context}) => context);
      ctxs.sort((a, b) => a.depth - b.depth);

      if (ctxs.length) {
        const [{depth: min}] = ctxs;
        const top = ctxs.filter(({depth}) => depth === min);
        const uniq = top.filter((c, i) => top.indexOf(c) === i);
        for (const ctx of uniq) {
          DEBUG && console.log('Updating Sub-Root', formatNode(ctx));
          if (host) host.__stats.updates++;
          renderContext(ctx, generation);
        }
      }
      else {
        DEBUG && console.log('Updating Root', formatNode(context));
        if (host) host.__stats.updates++;
        renderContext(context, generation);
      }
    });
  };

  scheduler.bind(reenter);

  if (host) host.__stats.mounts++;
  return dispatch(() => renderContext(context));
}

export const renderPaint = (() => {
  const onPaint = makePaintRequester();
  return <F extends Function>(node: DeferredCall<F>) => {
    return new Promise((resolve) => {
      onPaint(() => resolve(renderSync(node)));
    });
  };
})();

export const renderSync = renderWithDispatch<LiveContext<any>>((t: Task) => t() as any as LiveContext<any>);
export const renderAsync = renderWithDispatch<void>((t: Task) => { setTimeout(t, 0); });
export const render = renderPaint;

export const renderContext = <F extends Function>(context: LiveContext<F>, generation?: number) => {
  if (generation !== undefined) context.generation = generation;

  const out = context.bound.apply(null, context.args ?? NO_ARGS);

  const isArray = !!out && Array.isArray(out);
  const node  = !isArray ? out as DeferredCall<any> : null;
  const nodes =  isArray ? out as DeferredCall<any>[] : null; 
  const n = isArray ? nodes!.length : +!!node;

  let {mounts} = context;
  if (!mounts && n) mounts = context.mounts = new Map();

  if (mounts) {
    if (node) {
      const key = node.key ?? 0;
      const prev = mounts.get(key) ?? null;
      updateNode(context, key, prev, node);
    }
    else if (nodes) {
      let index = 0;
      for (const node of nodes) {
        // Insert/update rendered nodes
        const key = node.key ?? index++;
        const prev = mounts.get(key) ?? null;
        updateNode(context, key, prev, node);
      }
    }

    if (mounts.size === n) return context;
    for (const key of mounts.keys()) {
      // Unmount unrendered nodes
      const prev = mounts.get(key);
      if (prev && (prev.generation !== context.generation)) updateNode(context, key, prev, null);
    }
  }

  return context;
}

export const disposeContext = <F extends Function>(context: LiveContext<F>) => {
  const {mounts} = context;
  if (mounts) for (const key of mounts.keys()) {
    const prev = mounts.get(key);
    if (prev) disposeContext(prev);
  }
  if (context.host) context.host.dispose(context);
}

export const updateNode = <P extends Function>(
  context: LiveContext<P>,
  key: Key,
  prev: LiveContext<any> | null,
  next: DeferredCall<any> | null,
) => {
  const {mounts, host} = context;

  const from = prev?.f;
  const to = next?.f;
  let replace = from && to && from !== to;

  const isFromFork = from === FORK_NODE;
  const isToFork   = to   === FORK_NODE;
  if (isFromFork && isToFork && prev!.args![0] !== next!.args![0]) replace = true;

  if ((!to && from) || replace) if (prev) {
    DEBUG && console.log('Unmounting', key, formatNode(prev));
    if (host) host.__stats.unmounts++;

    mounts!.delete(key);
    disposeContext(prev);
  }

  if ((to && !from) || replace) if (next) {
    DEBUG && console.log('Mounting', key, formatNode(next));
    if (host) host.__stats.mounts++;

    const child = makeSubContext(context, next);
    mounts!.set(key, child);

    if (isToFork) {
      const [fork] = next.args as [LiveContext<any>, DeferredCall<any>];
      const m = child.mounts = new Map();
      m.set(0, fork);
    }
    else {
      renderContext(child);
    }
  }

  if (from && to && !replace) if (prev && next) {
    DEBUG && console.log('Updating', key, formatNode(next));
    if (host) host.__stats.updates++;

    prev.generation = context.generation;
    prev.args = next?.args;

    if (!isToFork) {
      renderContext(prev);
    }
  }
}
