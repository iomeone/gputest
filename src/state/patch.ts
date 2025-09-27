import { Update, Merge } from './types';

const $DELETE = {$delete: true};
const $NOP = {$nop: true};

/** Set or replace a value without merging.

```tsx
import { $set } from "@use-gpu/state";

const value = {
  hello: {text: 'world', bar: 2},
  foo: 1,
};

const update = {
  hello: $set({text: 'test'}),
};

expect(patch(value, update)).toEqual({
  hello: {text: 'test'},
  foo: 1,
});
```
*/
export const $set = <T>($set: T) => ({$set});

/** Merge two values. This is the default behavior for objects, so exists mostly for clarity.

```tsx
import { $merge } from "@use-gpu/state";

const value = {
  hello: {text: 'world', bar: 2},
  foo: 1,
};
const update = {
  hello: $merge({text: 'test'}),
};

expect(patch(value, update)).toEqual({
  hello: {text: 'test', bar: 2},
  foo: 1,
});
```
*/
export const $merge = <T>($merge: T) => ({$merge});

/** Delete a value.

```tsx
import { $delete } from "@use-gpu/state";

const value = {
  hello: {text: 'world', bar: 2},
  foo: 1,
};

const update = {
  foo: $delete(),
};

expect(patch(value, update)).toEqual({
  hello: {text: 'world', bar: 2},
});
```
*/
export const $delete = <T>() => $DELETE;

/** No-op */
export const $nop = <T>() => $NOP;

/** Apply a function to a value.

```tsx
import { $apply } from "@use-gpu/state";

const value = {
  hello: {text: 'world', bar: 2},
  foo: 1,
};

const update = {
  hello: {text: $apply(text => text + ' !!!') },
};

expect(patch(value, update)).toEqual({
  hello: {text: 'world !!!', bar: 2},
  foo: 1,
});
```
*/
export const $apply = <T>($apply: (t: T) => T) => ({$apply});

/** Apply a function that returns another patch to apply.

```tsx
import { $patch, $apply, $delete } from "@use-gpu/state";

const value = {
  hello: {text: 'world', bar: 2, other: 1},
  foo: 1,
};

const update = {
  hello: $patch(({other}) => ({
    text: $apply(text => other + ' !!!'),
    bar: $delete(),
  })),
};

expect(patch(value, update)).toEqual({
  hello: {text: '1 !!!', other: 1},
  foo: 1,
});
```
*/
export const $patch = <T>($patch: (t: T) => Update<T>) => ({$patch});

/** Patch value A with update B.

Supported operators: $set, $merge, $delete, $nop, $apply, $patch.
*/
export const patch = <T>(a: T, b: Update<T>): T => {
  if (b && typeof b === 'object') {
    if ('$nop' in b) return a;
    if ('$set' in b) return b.$set;
    if ('$apply' in b) return b.$apply(a);
    if ('$patch' in b) return patch(a, b.$patch(a));
    if ('$merge' in b) return merge(a, b.$merge);
    if ('$delete' in b) return undefined as any as T;
  }
  return merge(a, b);
}

const merge = <T>(a: T, b: Merge<T>): T => {
  if (typeof b === 'boolean') return b as any as T;
  if (typeof b === 'number') return b as any as T;
  if (typeof b === 'string') return b as any as T;
  if (Array.isArray(b)) return b as any as T;
  if (b === null) return b as any as T;
  if (b === undefined) return a;

  if (typeof b === 'object') {
    let update: Record<string, any> = b;
    if (typeof a !== 'object' || a == null) a = {} as any;

    if (Array.isArray(a)) {
      const out = [] as any[];
      const n = a.length;

      for (let i = 0; i < n; ++i) {
        if (update.hasOwnProperty(i)) {
          const v = patch(a[i], update[i.toString()]);
          if (v !== undefined) out.push(v);
        }
        else {
          out.push(a[i]);
        }
      }

      return out as any as T;
    }
    else {
      let obj: Record<string, any> = a as any;

      const out = {} as Record<string, any>;
      for (let k in obj) {
        if (update.hasOwnProperty(k)) {
          const v = patch(obj[k], update[k]);
          if (v !== undefined) out[k] = v;
        }
        else {
          out[k] = obj[k];
        }
      }
      for (let k in update) if (!obj.hasOwnProperty(k)) {
        const v = patch(undefined, update[k]);
        if (v !== undefined) out[k] = v;
      }
      return out as any as T;
    }
  }

  return a;
}
