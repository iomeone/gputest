// State patching
export type Update<T = any> = T
  | {$set: T}
  | {$merge: Merge<T>}
  | {$apply: (t: T) => T}
  | {$patch: (t: T) => Update<T>}
  | DeepUpdate<T>
  | undefined;

export type Merge<T = any> = T | DeepUpdate<T> | undefined;

export type DeepUpdate<T = any> = T extends (infer E)[]
  ? {[n: number]: Update<E>}
  : {[P in keyof T]?: Update<T[P]>};
