import type { VirtualDraw } from '../pass/types';
import type { UseGPURenderContext } from '@use-gpu/core';
import type { LiveComponent } from '@use-gpu/live';

import { makeContext, useContext, useNoContext } from '@use-gpu/live';

export type PassContextProps = {
  useVariants: (virtual: VirtualDraw, hovered: boolean) => null | LiveComponent | LiveComponent[],
  buffers: Record<string, UseGPURenderContext[]>,
  layout?: GPUBindGroupLayout,
  bind?: (...args: any[]) => (passEncoder: GPURenderPassEncoder) => void,
};

export const PassContext = makeContext<PassContextProps>(undefined, 'PassContext');

export const usePassContext = () => useContext<PassContextProps>(PassContext);
export const useNoPassContext = () => useNoContext(PassContext);
