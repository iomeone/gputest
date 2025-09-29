import type { ArrowFunction } from '@use-gpu/live';
import { useOne } from '@use-gpu/live';
import { useProp, getProp } from './useProp';
import { PropDef, PropDefTypes, UseTrait } from './types'; 

export const makeUseTrait = <
  T extends Record<string, any>,
  P extends PropDef = any,
>(
  propDef: P,
  defaultValues: Record<string, any>
): UseTrait<T, PropDefTypes<P>> => {
  const defaults: Record<string, any> = {};
  for (const k in propDef) defaults[k] = propDef[k](defaultValues[k]);
  return (props: Partial<T> | undefined) => useTrait(props, propDef, defaults);
};

export const makeParseTrait = <
  T extends Record<string, any>,
  P extends PropDef = any,
>(
  propDef: P,
  defaultValues: Record<string, any>
): UseTrait<T, PropDefTypes<P>> => {
  const defaults: Record<string, any> = {};
  for (const k in propDef) defaults[k] = propDef[k](defaultValues[k]);
  return (props: Partial<T> | undefined) => parseTrait(props, propDef, defaults);
};

const useTrait = <
  T extends Record<string, any>,
  P extends PropDef = any,
>(
  props: Partial<T> | undefined,
  propDef: P,
  defaults: Record<string, any>,
): PropDefTypes<P> => {
  const parsed: Record<string, any> = useOne(() => ({}));
  if (!props) return defaults;

  for (const k in propDef) {
    const v = props[k];
    parsed[k] = useProp(v, propDef[k], defaults ? defaults[k] : undefined);
  }

  return parsed as T;
};

const parseTrait = <
  T extends Record<string, any>,
  P extends PropDef = any,
>(
  props: Partial<T> | undefined,
  propDef: P,
  defaults: Record<string, any>,
): PropDefTypes<P> => {
  const parsed: Record<string, any> = {};
  if (!props) return defaults;

  for (let k in propDef) {
    const v = props[k];
    parsed[k] = getProp(v, propDef[k], defaults ? defaults[k] : undefined);
  }

  return parsed as T;
};
