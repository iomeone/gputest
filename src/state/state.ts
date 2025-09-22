import { Update, Merge } from './types';

export const $set = <T>($set: T) => ({$set});
export const $merge = <T>($merge: T) => ({$merge});
export const $delete = <T>() => ({$delete: true});
export const $nop = <T>() => ({$nop: true});
export const $apply = <T>($apply: (t: T) => T) => ({$apply});
export const $patch = <T>($patch: (t: T) => Update<T>) => ({$patch});

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

export const merge = <T>(a: T, b: Merge<T>): T => {
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
      let obj: Record<string, any> = a;

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
