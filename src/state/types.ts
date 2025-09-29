// State patching
export type Update<T = any> = T
  | {$set: T}
  | {$merge: Merge<T>}
  | {$apply: (t: T) => T}
  | {$patch: (t: T) => Update<T>}
  | {$nop: any}
  | {$delete: any}
  | DeepUpdate<T>
  | undefined;

export type Merge<T = any> = T | DeepUpdate<T> | undefined;

// Arrays are patched via object notation, derive the appropriate type.
export type DeepUpdate<T = any> = T extends (infer E)[]
  ? {[n: number]: Update<E>}
  : {[P in keyof T]?: Update<T[P]>};

export type UpdateKey = string | number;

// Cursors
export type Cursor<T> = [T, Updater<T>];
export type Updater<T> = (u: Update<T>) => void;

export type RefineCursor<T> = (cursor: Cursor<any>) => (...keys: UpdateKey[]) => Cursor<T>;

// Hooks
export type InitialState<T> = T | (() => T);
export type UseState<T> = <T>(initialState: InitialState<T>) => [T, Function];
