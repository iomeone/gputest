import { Dispatch, SetStateAction, useCallback, useState } from 'react';

export const makeUseLocalState = (
  key: string,
  unmarshal?: (t: any) => any,
) => <T,>(
  initial: T | (() => T),
): [T, Dispatch<SetStateAction<T>>] => {
  const [state, setState] = useState(() => {
    const item = window.localStorage.getItem(key);
    if (item) try {
      const obj = JSON.parse(item);
      return unmarshal ? unmarshal(obj) : obj;
    } catch (e) {};
    
    return typeof initial === 'function' ? (initial as any)() : initial;
  });

  const [lastKey, setLastKey] = useState(key);
  if (lastKey !== key) {
    setLastKey(key);
    setState(initial);
  }
  
  const setLocalState = useCallback((value: SetStateAction<T>) => {
    setState((state: T) => {
      state = typeof value === 'function' ? (value as any)(state) : value;
      try { window.localStorage.setItem(key, JSON.stringify(state)); } catch (e) {};
      return state;
    });
  }, []);
  
  return [state, setLocalState];
};
