// Live function
export type ArrowFunction = (...args: any[]) => any;
export type LiveFunction<F extends Function> = F;

// Component with single props object
export type LiveComponent<P> = (props: P) => LiveElement<any>;
export type Component<P> = LiveComponent<P>;

// Mounting key
export type Key = string | number;

// State hook callbacks
export type Initial<T> = (() => T) | T;
export type Reducer<T> = T | ((t: T) => T);
export type Setter<T> = (t: Reducer<T>) => void;
export type Resource<T> = () => (void | Task | [T, Task]);

// Renderer options
export type RenderOptions = {
  // Stack slicing depth
  stackSliceDepth: number,
};

// Hook types
export enum Hook {
  STATE = 0,
  MEMO = 1,
  ONE = 2,
  CALLBACK = 3,
  RESOURCE = 4,
  CONTEXT = 5,
  CONSUMER = 6,
  VERSION = 7,
};

// Deferred actions
export type Task = () => void;
export type Action<F extends Function> = {
  fiber: LiveFiber<F>,
  task: Task,
};
export type Dispatcher = (as: Action<any>[]) => void;

// Render callbacks
export type OnFiber<T = any> = (fiber: LiveFiber<any>) => T;
export type FiberSetter<T> = (fiber: LiveFiber<any>, t: T) => void;
export type RenderCallbacks = {
  dispatch: OnFiber<void>,
  onRender: (fiber: LiveFiber<any>, allowSlice?: boolean) => boolean,
  onUpdate: OnFiber<void>,
  onFence: OnFiber<void>,
};

// User=defined context
export type LiveContext<T> = { initialValue?: T, displayName?: string };

// Fiber data structure
export type LiveFiber<F extends Function> = FunctionCall<F> & {
  host?: HostInterface,
  path: Key[],
  depth: number,
  id: number,
  by: number,

  // Instance of F bound to self
  bound?: F,
  
  // State for user hooks
  state: any[] | null,
  pointer: number,

  // State for per-component memoization
  version: number | null,
  memo: number | null,

  // Last rendered return type
  type: ArrowFunction | null,

  // Mounting state
  seen: Set<Key> | null,
  mount: LiveFiber<any> | null,
  mounts: FiberMap | null,
  order: Key[] | null,
  next: LiveFiber<any> | null,

  // User-specified context
  context: FiberContext,

  // Yeeting state
  yeeted: FiberYeet<any> | null,

  // Count number of runs for inspector
  runs: number,

  __inspect?: Record<string, any> | null,
};

export type FiberMap = Map<Key, LiveFiber<any>>;

// Fiber context mapping
export type FiberContext = {
  values: ContextValues,
  roots: ContextRoots,
};

export type ContextValues = Map<LiveContext<any>, any>;
export type ContextRoots = Map<LiveContext<any>, LiveFiber<any>>;

// Fiber yeet state
export type FiberYeet<T> = {
  id: number,
  emit: FiberSetter<any>,
  value?: T,
  reduced?: T,
  parent?: FiberYeet<T>,
  root: LiveFiber<any>,
};

// Deferred function calls
export type FunctionCall<F extends Function = ArrowFunction> = {
  f: LiveFunction<F>,
  args?: any[],
  arg?: any
};

export type DeferredCall<F extends Function = ArrowFunction> = FunctionCall<F> & {
  key?: Key,
  by?: number,
};

export type LiveElement<F = any> = null | DeferredCall<any> | LiveElement<any>[];

// Priority queue
export type FiberQueue = {
  insert: (f: LiveFiber<any>) => void,
  remove: (f: LiveFiber<any>) => void,
  all: ()=> LiveFiber<any>[],
  peek: () => LiveFiber<any> | null,
  pop: () => LiveFiber<any> | null,
};

// Live host interface
export type HostInterface = {
  // Schedule a task on next flush
  schedule: (fiber: LiveFiber<any>, task: Task) => void,
  flush: () => void,

  // Track a future cleanup on a fiber
  track: (fiber: LiveFiber<any>, task: Task) => void,
  untrack: (fiber: LiveFiber<any>, task: Task) => void,

  // Dispose of a fiber by running all tracked cleanups
  dispose: (fiber: LiveFiber<any>) => void,

  // Track a long-range dependency for contexts
  depend: (fiber: LiveFiber<any>, root: LiveFiber<any>) => boolean,
  undepend: (fiber: LiveFiber<any>, root: LiveFiber<any>) => void,
  traceDown: (fiber: LiveFiber<any>) => LiveFiber<any>[],
  traceUp: (fiber: LiveFiber<any>) => LiveFiber<any>[],

  // Fiber update queue
  visit: (fiber: LiveFiber<any>) => void,
  unvisit: (fiber: LiveFiber<any>) => void,
  pop: () => LiveFiber<any> | null,
  peek: () => LiveFiber<any> | null,

  // Stack slicing
  slice: (fiber: LiveFiber<any>) => boolean,
  depth: (d: number) => void,

  __stats: {mounts: number, unmounts: number, updates: number, dispatch: number},
  __ping: (fiber: LiveFiber<any>, active?: boolean) => void,
};
