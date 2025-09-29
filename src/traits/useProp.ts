import { useOne } from '@use-gpu/live';

export const useProp = <A, B>(value: A | undefined, parse: (t?: A) => B, def?: B): B =>
  useOne(() => def !== undefined && value === undefined ? def : parse(value), value);

export const getProp = <A, B>(value: A | undefined, parse: (t?: A) => B, def?: B): B =>
  def !== undefined && value === undefined ? def : parse(value);

