import type { LC } from '@use-gpu/live';
import type { PassBindGroup, PassFlags, PassResources, VirtualDraw } from '../pass/types';

import { makeContext, useContext, useNoContext } from '@use-gpu/live';

export type PassContextProps = PassResources &  {
  bindGroups: Record<string, PassBindGroup>,
  options: PassFlags,
};

export type VariantContextProps = (virtual: VirtualDraw, hovered: boolean) => LC | LC[] | null | undefined;

export const PassContext = makeContext<PassContextProps>(undefined, 'PassContext');
export const VariantContext = makeContext<VariantContextProps>(undefined, 'VariantContext');

export const usePassContext = () => useContext<PassContextProps>(PassContext);
export const useNoPassContext = () => useNoContext(PassContext);

export const useVariantContext = () => useContext<VariantContextProps>(VariantContext);
export const useNoVariantContext = () => useNoContext(VariantContext);
