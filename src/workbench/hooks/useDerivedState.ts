import { resolve } from '@use-gpu/core';
import { useOne, useState, useVersion } from '@use-gpu/live';

type Initial<T> = T | (() => T);
type Setter<T> = (t: T | ((t: T) => T)) => void;

export const useDerivedState = <T>(
  initialState: Initial<T>,
  version: number = 0,
): [T, Setter<T>] => {
  const [value, setValue] = useState<T>(initialState);

  const newInitial = resolve(initialState);
  const v = useVersion(newInitial) + version;
  useOne(() => {
    setValue(newInitial);
  }, v);

  return [value, setValue];
};
