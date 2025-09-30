import type { UseOne, UseProp } from './types';

/**
 * useProp() implementation. (Live/React polyglot)
 *
 * Parse a prop value with a parser and a default.
 */
export const injectUseProp = (useOne: UseOne): UseProp => <A, B>(value: A | undefined, parse: (t?: A) => B, def?: B): B =>
  useOne(() => def !== undefined && value === undefined ? def : parse(value), value);

/**
 * Parse a prop value with a parser and a default.
 */
export const getProp: UseProp = <A, B>(value: A | undefined, parse: (t?: A) => B, def?: B): B =>
  def !== undefined && value === undefined ? def : parse(value);
