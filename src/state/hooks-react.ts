import { useCallback, useMemo, useRef, useState } from 'react';
import { injectUseCursor, injectUseUpdateState } from './hooks';

import { Pair, Cursor, Initial, UseState } from './types';
export * from './types';

type UseCursor = <T>(
  pair: Pair<T>,
  defaults?: T
) => Cursor<T>;

type UseUpdateState = <T>(
  initialState: Initial<T>,
  useStateHook?: UseState,
) => Pair<T>;

/**
Make a cursor from a `[value, updater]` pair, as returned by `@{useUpdateState}`.

- Traverse `cursor.foo.bar` to get a new cursor.
- Call `cursor.foo.bar()` to get a new getter/updater pair.

If `defaults` are supplied, the cursor will merge them in.
When the first update is made, it will dispatch a `$set` operation first
to permanently insert them, and allow a clean patch to be made.
*/
export const useCursor: UseCursor = injectUseCursor(useMemo, useRef);

/**
`useState` with an `updateState` instead of a `setState`. Uses `patch` to apply updates.

```tsx
const [state, updateState] = useUpdateState({ ... });
```

When combined with `@{useCursor}`, this allows for zero-hassle state management.

Compose this hook with other `useState` variants using `useStateHook`, e.g. the classic `useLocalStorage` that saves to browser local storage.
*/
export const useUpdateState: UseUpdateState = injectUseUpdateState(useCallback, useMemo, useState);
