import { useCallback, useMemo, useState } from 'react';
import { Update } from '@use-gpu/state/types';

import { patch, $set } from '@use-gpu/state';

export type Cursor<T> = [T, Updater<T>];
export type Updater<T> = (u: Update<T>) => void;

type Key = string | number;
type RefineCursor<T> = (cursor: Cursor<any>) => (...keys: Key[]) => Cursor<T>

export const refineCursor = <T>(
  cursor: Cursor<any>,
  defaults?: Record<string, any>,
) => <S = T>(...keys: Key[]): Cursor<S> => {
  let [v, u] = cursor;
  let d = defaults;

  for (const k of keys) {
    let updater = u;

    d = d != null ? d[k] : undefined;
    v = v != null ? v[k] : undefined;

    if (v === undefined && d !== undefined) {
      let once = true;

      v = d;
      u = (update: any) => {
        if (once) updater({ [k]: $set(d) });
        updater({ [k]: update });
        once = false;
      };
    }
    else {
      u = (update: any) => updater({ [k]: update });
    }
  }
  return [v, u];
};

export const useRefineCursor = <T>(cursor: Cursor<any>) => <S = T>(...keys: Key[]) => (
  useMemo(() => refineCursor(cursor)<S>(...keys), [cursor, ...keys])
);

export const useUpdateState = <T>(initialState: T | (() => T)): Cursor<T> => {
  const [state, setState] = useState(initialState);

  const updateState = useCallback((update: Update<T>) =>
    setState((s) => patch(s, update)),
    []);

  // eslint-disable-next-line
  return useMemo(() => [state, updateState] as Cursor<T>, [state]);
}
