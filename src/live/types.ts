// Live function
export type ArrowFunction = (...args: any[]) => any;
export type LiveFunction<F extends Function = ArrowFunction> = F;

// Component with single props object
export type RawLiveComponent<P> = (props: P) => LiveElement;

// React/JSX types interop
export type PropsWithChildren<P> = P & { children?: string | LiveNode<any> };
export type LiveComponent<P = object> = ((props: PropsWithChildren<P>) => any) & { displayName?: string };
export type Component<P = object> = LiveComponent<P>;
export type LC<P = object> = LiveComponent<P>;
export type Ref<T> = { current: T; };
export type RefObject<T> = { current: T | null };
export interface MutableRefObject<T> { current: T; };

export type ReactElementInterop = {
  type: any,
  props: any,
  key: any,
};

export type LivePure<F extends Function = ArrowFunction> = undefined | null | DeferredCall<F> | LivePure<any>[];
export type LiveElement<F extends Function = ArrowFunction> = undefined | null | DeferredCall<F> | LiveElement[] | ReactElementInterop;
export type LiveNode<F extends Function = ArrowFunction> = LiveElement<F> | string | ArrowFunction | Array<LiveNode<any>>;

// Mounting key
export type Key = string | number;

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

export type DeferredCallInterop<F extends Function = ArrowFunction> = DeferredCall<F> | ReactElementInterop;

// State hook callbacks
export type Initial<T> = (() => T) | T;
export type Reducer<T> = T | ((t: T) => T);
export type Setter<T> = (t: Reducer<T>) => void;
export type Resource<T> = () => (void | Task | [T, Task]);

// Renderer options
export type RenderOptions = {
  // Stack slicing depth
  stackSliceDepth: number,

  // Strict queue reordering
  strictQueueOrder: boolean,

  // Strict stack slice reordering
  strictSliceOrder: boolean,
};

// Hook types
export enum Hook {
  STATE = 0,
  MEMO = 1,
  ONE = 2,
  CALLBACK = 3,
  RESOURCE = 4,
  CONTEXT = 5,
  CAPTURE = 6,
  VERSION = 7,
  YOLO = 8,
};

// Deferred actions
export type Task = () => void;
export type MaybeTask = () => boolean;

// Render callbacks
export type OnFiber<T = any> = (fiber: LiveFiber<any>) => T;
export type FiberSetter<T> = (fiber: LiveFiber<any>, t: T) => void;
export type FiberGather<T> = (fiber: LiveFiber<any>, self?: boolean) => T;
export type RenderCallbacks = {
  dispatch: OnFiber<void>,
  onRender: (fiber: LiveFiber<any>, allowSlice?: boolean) => boolean,
  onUpdate: OnFiber<void>,
  onFence: OnFiber<void>,
};

// User=defined context
export type LiveContext<T> = { initialValue?: T, displayName?: string, context?: true, capture?: false };
export type LiveCapture<T> = { displayName?: string, capture?: true, context?: false };
export type LiveMap<T> = Map<LiveFiber<any>, T>;

// Fiber data structure
export type LiveFiber<F extends Function> = FunctionCall<F> & {
  host?: HostInterface,
  path: Key[],
  keys: (number | Map<Key, number>)[],
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
  mount: LiveFiber<any> | null,
  mounts: FiberMap | null,
  next: LiveFiber<any> | null,
  order: Key[] | null,
  lookup: Map<Key, number> | null,

  // User-specified context
  context: FiberContext,

  // Yeeting state
  yeeted: FiberYeet<any, any> | null,
  fork: boolean,

  // Quoting state
  quote: FiberQuote<any> | null,
  unquote: FiberQuote<any> | null,

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

export type ContextValues = Map<LiveContext<any> | LiveCapture<any>, any>;
export type ContextRoots = Map<LiveContext<any> | LiveCapture<any>, number | LiveFiber<any>>;

// Fiber yeet state
export type FiberYeet<A, B> = {
  id: number,
  emit: FiberSetter<A>,
  gather: FiberGather<B>,
  root: LiveFiber<any>,
  value?: A,
  reduced?: B,
  parent?: FiberYeet<A, B>,
  scope?: FiberYeet<any, any>,
};

// Fiber quote state
export type FiberQuote<F extends ArrowFunction> = {
  root: number,
  from: number,
  to: LiveFiber<F>,
  scope?: FiberQuote<any>,
};

// Priority queue
export type FiberQueue = {
  insert: (f: LiveFiber<any>) => void,
  remove: (f: LiveFiber<any>) => void,
  all: ()=> LiveFiber<any>[],
  peek: () => LiveFiber<any> | null,
  pop: () => LiveFiber<any> | null,
  reorder: (f: LiveFiber<any>) => void,
};

// Live host interface
export type HostInterface = {
  // Schedule a task on next flush
  schedule: (fiber: LiveFiber<any>, task?: MaybeTask) => void,
  flush: () => void,

  // Track a future cleanup on a fiber
  track: (fiber: LiveFiber<any>, task: Task) => void,
  untrack: (fiber: LiveFiber<any>, task: Task) => void,

  // Dispose of a fiber by running all tracked cleanups
  dispose: (fiber: LiveFiber<any>) => void,

  // Track a long-range dependency for contexts
  depend: (fiber: LiveFiber<any>, root: number) => boolean,
  undepend: (fiber: LiveFiber<any>, root: number) => void,
  traceDown: (fiber: LiveFiber<any>) => LiveFiber<any>[],
  traceUp: (fiber: LiveFiber<any>) => number[],

  // Fiber update queue
  visit: (fiber: LiveFiber<any>) => void,
  unvisit: (fiber: LiveFiber<any>) => void,
  pop: () => LiveFiber<any> | null,
  peek: () => LiveFiber<any> | null,
  reorder: (fiber: LiveFiber<any>) => void,

  // Stack slicing
  depth: (d: number) => void,
  slice: (d: number) => boolean,

  // Id generator
  id: () => number,

  __stats: {mounts: number, unmounts: number, updates: number, dispatch: number},
  __ping: (fiber: LiveFiber<any>, active?: boolean) => void,
  __highlight: (id: number | null, active?: boolean) => void,
};
