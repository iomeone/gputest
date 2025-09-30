import { useMemo, useRef } from 'react';
import { injectUseProp } from './useProp';
import { injectUseTrait, injectMakeUseTrait } from './useTrait';

type ArrowFunction = (...args: any[]) => any;
const useOne = <F extends ArrowFunction>(f: F, dep?: any) => {
  const ref = useRef<any>(dep === undefined ? null : undefined) as any;
  if (ref.current !== dep) {
    ref.value = f();
  }
  return ref.value;
};

export const useProp = injectUseProp(useOne);

const HOOKS = {useMemo, useOne, useProp};

export const useTrait = injectUseTrait(HOOKS);
export const makeUseTrait = injectMakeUseTrait(HOOKS);
