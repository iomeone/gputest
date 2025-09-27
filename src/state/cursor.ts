import { useCallback, useMemo, useState } from 'react';
import { Cursor, InitialState, Update, UpdateKey, UseState } from './types';

import { patch, $set } from './patch';

/**
Refine a cursor (a `[value, updateValue]` pair) to traverse its `value` along `keys` and produce new cursors.

If `defaults` are supplied, the cursor will merge them in.
When the first update is made, it will dispatch a $set operation first
to permanently insert them, and allow a clean patch to be made.

The first part of the higher-order function can be called once and then reused for different paths.
*/
export const refineCursor = <T>(
  cursor: Cursor<any>,
  defaults?: Record<string, any>,
) => <S = T>(...keys: UpdateKey[]): Cursor<S> => {
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

/**
Refine a cursor (a `[value, updateValue]` pair) to traverse its `value` along `keys` and produce new cursors.

If `defaults` are supplied, the cursor will merge them in.
When the first update is made, it will dispatch a $set operation first
to permanently insert them, and allow a clean patch to be made.

The first part of the higher-order function returns a a new hook, `useCursor`, which must obey the rules of hooks.
*/
export const useRefineCursor = <T>(cursor: Cursor<any>) => <S = T>(...keys: UpdateKey[]) => (
  useMemo(() => refineCursor(cursor)<S>(...keys), [cursor, ...keys])
);

/**
`useState` variant which has an `updateValue` instead of a `setValue` and does automatic patching of updates.

When combined with `${useRefineCursor}`, this allows for zero-hassle state management.

Compose this hook with other `useState` variants using `useStateHook`, e.g. the classic `useLocalState` that saves to Local Storage.
*/
export const useUpdateState = <T>(initialState: InitialState<T>, useStateHook: UseState<T> = useState): Cursor<T> => {
  const [state, setState] = useState(initialState);

  const updateState = useCallback((update: Update<T>) =>
    setState((s) => patch(s, update)),
    []);

  // eslint-disable-next-line
  return useMemo(() => [state, updateState] as Cursor<T>, [state]);
};
