import { useMemo, useOne } from '@use-gpu/live';
import { injectUseProp } from './useProp';
import { injectUseTrait, injectMakeUseTrait } from './useTrait';

export const useProp = injectUseProp(useOne);

const HOOKS = {useMemo, useOne, useProp};

export const useTrait = injectUseTrait(HOOKS);
export const makeUseTrait = injectMakeUseTrait(HOOKS);
