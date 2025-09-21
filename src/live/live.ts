import {
  Initial, Setter, Reducer, Key, Task,
  Live, LiveContext, CallContext,
  DeferredCall, HostInterface,
} from './types';

export const FORK_NODE = () => () => {};

// Prepare to call a live function with optional given context
export const bind = <F extends Function>(f: Live<F>, context?: LiveContext<F> | null) => {
  const c = context ?? makeContext(f, null);
  const bound = f(c);
  return bound;
};

// Defer a call to a live function
export const defer = <F extends Function>(
  f: Live<F>,
  key?: Key,
) => (
  ...args: any[]
): DeferredCall<F> => ({f, args, key});

// Fork the rendering of a subtree
export const fork = <F extends Function>(
  context: LiveContext<F>,
  key?: Key,
): DeferredCall<() => void> => ({f: FORK_NODE, args: [context], key});

// Make a context for a live function
export const makeContext = <F extends Function>(
  f: Live<F>,
  host?: HostInterface | null,
  parent?: LiveContext<any> | null,
  args?: any[],
): LiveContext<F> => {
  const state = [] as any[];
  const depth = parent ? parent.depth + 1 : 0;
  const generation = parent ? parent.generation : 0;

  const self = {state, bound: null, f, args, depth, generation, host} as any as LiveContext<F>;
  self.bound = bind(f, self);

  return self;
};

// Hold call info for a context
export const makeCallContext = <F extends Function>(
  f: Live<F>,
  args?: any[],
): CallContext<F> => ({f, args});

// Prepare a new sub context for continued rendering
export const makeSubContext = <F extends Function>(
  parent: LiveContext<any>,
  node: DeferredCall<F>,
): LiveContext<F> => {
  const {host} = parent;
  const context = makeContext(node.f, host, parent, node.args);
  return context;
}
