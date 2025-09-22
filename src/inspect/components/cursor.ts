import { useCallback, useMemo, useState } from 'react';

export type Cursor<T> = [T, Updater<T>];
export type Updater<T> = (u: Update<T>) => void;

export type Update<T> = 
  T |
  DeepUpdate<T> |
  { $set: T };

export type DeepUpdate<T> = {
  [P in keyof T]?: Update<T[P]>;
};

type RefineCursor<T> = (cursor: Cursor<any>) => (...keys: string[]) => Cursor<T>

export const refineCursor = <T>(cursor: Cursor<any>) => <S = T>(...keys: string[]): Cursor<S> => {
  let [v, u] = cursor;
  for (const k of keys) {
    let updater = u;

    v = v[k];
    u = (update: any) => updater({ [k]: update });
  }
  return [v, u];
};

export const useRefineCursor = <T>(cursor: Cursor<any>) => <S = T>(...keys: string[]) => (
  useMemo(() => refineCursor(cursor)<S>(...keys), [cursor, ...keys])
);

export const useUpdateState = <T>(initialState: T | (() => T)): Cursor<T> => {
  const [state, setState] = useState(initialState);

  const updateState = useCallback((update: Update<T>) => {
    setState((s) => patch(s, update));
  }, []);

  // eslint-disable-next-line
  const cursor = useMemo(() => [state, updateState] as Cursor<T>, [state]);

  return cursor;
}

export const patch = <T>(a: T, b: Update<T>): T => {
  const bb = b as any;
  if (bb && bb.hasOwnProperty('$set')) return bb.$set;
  return merge(a, b as any);
}

export const merge = <T>(a: T, b: T | DeepUpdate<T>): T => {
  if (Array.isArray(b)) return b as any;
  if (b == null) return b;
  if (typeof b === 'object') {
    const aa = a as any;
    const bb = b as any;
    const o = {} as Record<string, any>;
    if (typeof aa === 'object') {
      if (Array.isArray(aa)) {
        const out = [];
        const n = aa.length;
        for (let i = 0; i < n; ++i) {
          if (bb.hasOwnProperty(i)) {
            const v = patch(aa[i], bb[i]);
            if (v !== undefined) out.push(v);
          }
          else {
            out.push(aa[i]);
          }
        }
        for (let k in bb) {
          if (!aa.hasOwnProperty(k)) o[k] = patch(undefined, bb[k]);
        }
        return out as any;
      }
      else {
        for (let k in aa) {
          if (bb.hasOwnProperty(k)) {
            const v = patch(aa[k], bb[k]);
            if (v !== undefined) o[k] = v;
          }
          else o[k] = aa[k];
        }
        for (let k in bb) {
          if (!aa.hasOwnProperty(k)) o[k] = patch(undefined, bb[k]);
        }
      }
    }
    else {
      for (let k in bb) {
        o[k] = patch(undefined, bb[k]);
      }
    }
    return o as any;
  }
  return b as any;
}
