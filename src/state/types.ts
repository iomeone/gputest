/** Mutation-as-value

- An update is a `DeepPartial<T>`, i.e. recursive `Partial<T>`
- Allows for deep `Update<T>`
- With extra `$ops`
- Apply functions with `$apply` or `$patch`
*/
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

/** Cursors

- Traverse: `const barCursor = cursor.foo.bar;`
- Resolve: `const [value, updateValue] = cursor.foo.bar();`
*/
export type Cursor<T> = (() => Pair<T>) & DeepCursor<T>;

export type DeepCursor<T = any> = T extends (infer E)[]
  ? {[n: number]: Cursor<E>}
  : {[P in keyof T]: Cursor<T[P]>};

export type Pair<T> = [T, Updater<T>];
export type Updater<T> = (u: Update<T>) => void;

// Hooks
export type Initial<T> = T | (() => T);
export type Setter<T> = (t: T | ((t: T) => T)) => void;

type ArrowFunction = (...args: any[]) => any;
export type UseCallback = <F extends ArrowFunction>(callback: F, deps: any[]) => F;
export type UseMemo = <T>(memoValue: () => T, deps: any[]) => T;
export type UseRef = <T>(t: T) => ({current: T | null});
export type UseState = <T>(initialState: Initial<T>) => [T, Setter<T>];
