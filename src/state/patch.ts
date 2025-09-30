import { Update, Merge } from './types';

const $DELETE = {$delete: true};
const $NOP = {$nop: true};

const isTypedArray = (() => {
  const TypedArray = Object.getPrototypeOf(Uint8Array);
  return (obj: any) => obj instanceof TypedArray;
})();

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
export const $set = <T>($set: T): Update<T> => ({$set});

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
export const $merge = <T>($merge: T): Update<T> => ({$merge});

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
export const $delete = (): Update<any> => $DELETE;

/** No-op */
export const $nop = (): Update<any> => $NOP;

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

const $maybeSet = <T>(v: T): Update<T> => {
  if (!v || typeof v !== 'object' || Array.isArray(v) || isTypedArray(v)) return v;
  return $set(v) as any;
};

/** Patch value A with update B.

Supported operators:
- `@{$apply}`
- `@{$delete}`
- `@{$merge}`
- `@{$nop}`
- `@{$patch}`
- `@{$set}`

*/
export const patch = <T>(a: T, b: Update<T>): T => {
  if (b && typeof b === 'object') {
    if ('$nop' in b) return a;
    if ('$set' in b) return b.$set;
    if ('$apply' in b) return b.$apply(a);
    if ('$patch' in b) return patch(a, b.$patch(a));
    if ('$merge' in b) return merge(a, b.$merge);
    if ('$delete' in b) return undefined as any;
  }
  return merge(a, b);
}

const merge = <T>(a: T, b: Merge<T>): T => {
  if (typeof b === 'boolean') return b as any;
  if (typeof b === 'number') return b as any;
  if (typeof b === 'string') return b as any;
  if (Array.isArray(b) || isTypedArray(b)) return b as any;
  if (b === null) return b as any;
  if (b === undefined) return a;

  if (typeof b === 'object') {
    const update: Record<string, any> = b;
    if (typeof a !== 'object' || a == null) a = {} as any;

    if (Array.isArray(a)) {
      const out = [] as any[];
      const n = a.length;

      for (let i = 0; i < n; ++i) {
        if (Object.hasOwn(update, i)) {
          const v = patch(a[i], update[i.toString()]);
          if (v !== undefined) out.push(v);
        }
        else {
          out.push(a[i]);
        }
      }

      return out as any as T;
    }
    else if (isTypedArray(a)) {
      throw new Error("Can't patch typed array with merge");
    }
    else {
      const obj: Record<string, any> = a as any;

      const out = {} as Record<string, any>;
      for (const k in obj) {
        if (Object.hasOwn(update, k)) {
          const v = patch(obj[k], update[k]);
          if (v !== undefined) out[k] = v;
        }
        else {
          out[k] = obj[k];
        }
      }
      for (const k in update) if (!Object.hasOwn(obj, k)) {
        const v = patch(undefined, update[k]);
        if (v !== undefined) out[k] = v;
      }
      return out as any as T;
    }
  }

  return a;
}

/** Revise update B with values from A.

Supported operators:
- `@{$apply}`
- `@{$delete}`
- `@{$merge}`
- `@{$nop}`
- `@{$patch}`
- `@{$set}`

*/
export const revise = <T>(a: T, b: Update<T>): Update<T> => {
  if (b && typeof b === 'object') {
    if ('$nop' in b) return $nop();
    if ('$set' in b) return $maybeSet(a);
    if ('$apply' in b) return diff(b.$apply(a), a);
    if ('$patch' in b) return revise(a, b.$patch(a));
    if ('$merge' in b) return pick(a, b.$merge);
    if ('$delete' in b) return $maybeSet(a);
  }
  return pick(a, b);
}

const pick = <T>(a: T, b: Update<T>): Update<T> => {
  if (typeof a === 'boolean') return a as any;
  if (typeof a === 'number') return a as any;
  if (typeof a === 'string') return a as any;
  if (a === null) return a as any;
  if (a === undefined) return $DELETE;

  if (Array.isArray(b) || isTypedArray(b) || b === null) return $maybeSet(a) as any;

  if (typeof b === 'object') {
    const update: Record<string, any> = b as any;
    if (typeof a !== 'object' || a == null) return $maybeSet(a as T);

    const out = {} as Record<string, any>;

    if (Array.isArray(a) || isTypedArray(a)) {
      const aa: any[] = a as any;
      for (const k in update) {
        const i = +k;
        if (Object.hasOwn(aa, i)) {
          out[i] = revise(aa[i], update[k]);
        }
        else {
          out[i] = $DELETE;
        }
      }
    }
    else {
      const aa: Record<string, any> = a as any;

      for (const k in aa) {
        if (Object.hasOwn(update, k)) {
          out[k] = revise(aa[k], update[k]);
        }
      }

      for (const k in update) if (!Object.hasOwn(aa, k)) {
        out[k] = $DELETE;
      }
    }

    return out as any;
  }

  throw new Error(`Unsupported revise "${a}" vs "${b}"`);
}

/** Diff values A and B

Ensures `patch(A, diff(A, B))` equals `B`.

*/
export const diff = <T>(a: T, b: T): Update<T> => {
  if (a === b) return undefined;

  if (typeof b === 'boolean') return b as any;
  if (typeof b === 'number') return b as any;
  if (typeof b === 'string') return b as any;
  if (Array.isArray(b) || isTypedArray(b)) return b as any;
  if (b === null) return b as any;
  if (b === undefined) return $DELETE;

  if (typeof b === 'object') {
    const bb: Record<string, any> = b;
    if (typeof a !== 'object' || a == null) return $maybeSet(b as T);
    if (Array.isArray(a) || isTypedArray(a)) return $maybeSet(b as T);

    const aa: Record<string, any> = a as any;

    const out = {} as Record<string, any>;
    for (const k in aa) {
      if (Object.hasOwn(bb, k)) {
        const v = diff(aa[k], bb[k]);
        if (v !== undefined) out[k] = v;
      }
      else {
        out[k] = $DELETE;
      }
    }
    for (const k in bb) if (!Object.hasOwn(aa, k)) {
      const v = bb[k];
      out[k] = v && typeof v === 'object' && !Array.isArray(v) ? $set(v) : v;
    }
    return out as any;
  }

  throw new Error(`Unsupported diff "${a}" vs "${b}"`);
}

/** Get keys with non-no-op changes
*/
export const getUpdateKeys = <T>(update: T): string[] => {
  const keys: string[] = [];

  const recurse = (b: Update<T>, path: string | null) => {
    if (b && typeof b === 'object') {
      if ('$nop' in b) return;
      if ('$set' in b) return keys.push(path ?? '');
      if ('$apply' in b) return keys.push(path ?? '');
      if ('$patch' in b) return keys.push(path ?? '');
      if ('$merge' in b) return pick(b.$merge, path);
      if ('$delete' in b) return keys.push(path ?? '');
    }
    return pick(b, path);
  };

  const pick = (b: Update<T>, path: string | null) => {
    if (b && typeof b === 'object') {
      const bb = b as any;
      if (Array.isArray(b) || isTypedArray(b)) {
        return keys.push(path ?? '');
      }
      for (const k in bb) {
        recurse(bb[k], path != null ? path + '.' + k : k);
      }
    }
    else if (b !== undefined) {
      keys.push(path ?? '');
    }
  }

  recurse(update, null);
  return keys;
}
