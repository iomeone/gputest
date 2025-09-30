import type { VirtualDraw } from '../pass/types';
import type { UseGPURenderContext } from '../../core';
import type { LiveComponent } from '../../live';

import { makeContext, useContext, useNoContext } from '../../live';

export type PassContextProps = {
  buffers: Record<string, UseGPURenderContext[]>,
  context: Record<string, any>,
  layout?: GPUBindGroupLayout,
  bind?: (...args: any[]) => (passEncoder: GPURenderPassEncoder) => void,
};

export type VariantContextProps = (virtual: VirtualDraw, hovered: boolean) => null | LiveComponent | LiveComponent[];

export const PassContext = makeContext<PassContextProps>(undefined, 'PassContext');
export const VariantContext = makeContext<VariantContextProps>(undefined, 'VariantContext');

export const usePassContext = () => useContext<PassContextProps>(PassContext);
export const useNoPassContext = () => useNoContext(PassContext);

export const useVariantContext = () => useContext<VariantContextProps>(VariantContext);
export const useNoVariantContext = () => useNoContext(VariantContext);
