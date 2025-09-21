// Live function
export type LiveFunction<F extends Function> = (fiber: LiveFiber<F>) => F;

// Mounting key
export type Key = string | number;

// Component with single props object
export type Component<P> = (props: P) => LiveElement<any>;
export type LiveComponent<P> = LiveFunction<Component<P>>;

// State hook callbacks
export type Initial<T> = (() => T) | T;
export type Reducer<T> = T | ((t: T) => T);
export type Setter<T> = (t: Reducer<T>) => void;
export type Resource<T> = () => (void | Task | [T, Task]);

// Deferred actions
export type Task = () => void;
export type Action<F extends Function> = {
  fiber: LiveFiber<F>,
  task: Task,
};
export type Dispatcher = (as: Action<any>[]) => void;
export type OnFiber = (fiber: LiveFiber<any>) => void;
export type FiberSetter<T> = (fiber: LiveFiber<any>, t: T) => void;

// User=defined context
export type LiveContext<T> = { initialValue?: T, displayName?: string };

// Fiber context
export type LiveFiber<F extends Function> = FunctionCall<F> & {
  host?: HostInterface,
  path: Key[],
  depth: number,
	id: number,

  // Instance of F bound to self
  bound?: F,
  
  // State for user hooks
  state: any[],
  pointer: number,

  // State for per-component memoization
  version: number,
  memo: number,

  // Last snapshot
  type: Function,

  // Mounting state
  seen?: Set<Key>,
  mount?: LiveFiber<any> | null,
  mounts?: FiberMap | null,
  order?: Key[],
  next?: LiveFiber<any> | null,

  // User-specified context
  context: FiberContext,

  // Yeeting state
  yeeted?: FiberYeet<any>,
};

export type FiberMap = Map<Key, LiveFiber<any>>;

export type FiberContext = {
  values: ContextValues,
  roots: ContextRoots,
};

export type ContextValues = Map<LiveContext<any>, any>;
export type ContextRoots = Map<LiveContext<any>, LiveFiber<any>>;

export type FiberYeet<T> = {
  id: number,
  emit: FiberSetter<any>,
  value?: T,
  reduced?: T,
  parent?: FiberYeet<T>,
  roots: LiveFiber<any>[],
};

export type GroupedFibers = {
  root: LiveFiber<any>,
  subs: Set<LiveFiber<any>>,
};

// Deferred function calls
export type FunctionCall<F extends Function = Function> = {
  f: LiveFunction<F>,
  args?: any[],
  arg?: any
};

export type DeferredCall<F extends Function = Function> = FunctionCall<F> & {
  key?: Key,
};

export type LiveElement<F = any> = null | DeferredCall<any> | LiveElement<any>[];

// Live host interface
export type HostInterface = {
  // Schedule a task on next flush
  schedule: (fiber: LiveFiber<any>, task: Task) => void,

  // Track a future cleanup on a fiber
  track: (fiber: LiveFiber<any>, task: Task) => void,

  // Dispose of a fiber by running all tracked cleanups
  dispose: (fiber: LiveFiber<any>) => void,

  // Track a long-range dependency for contexts
  depend: (fiber: LiveFiber<any>, root: LiveFiber<any>) => boolean,
  undepend: (fiber: LiveFiber<any>, root: LiveFiber<any>) => void,
  invalidate: (fiber: LiveFiber<any>) => LiveFiber<any>[],

  __stats: {mounts: number, unmounts: number, updates: number, dispatch: number},
  __flush: () => void,
  __ping: (fiber: LiveFiber<any>) => void,
};
