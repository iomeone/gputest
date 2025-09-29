import type { VirtualDraw } from '../pass/types';
import type { UseGPURenderContext } from '../../core';
import type { LiveComponent } from '../../live';

import { makeContext, useContext, useNoContext } from '../../live';

export type PassContextProps = {
  useVariants: (virtual: VirtualDraw, hovered: boolean) => null | LiveComponent | LiveComponent[],
  buffers: Record<string, UseGPURenderContext[]>,
  layout?: GPUBindGroupLayout,
  bind?: (...args: any[]) => (passEncoder: GPURenderPassEncoder) => void,
};

export const PassContext = makeContext<PassContextProps>(undefined, 'PassContext');

export const usePassContext = () => useContext<PassContextProps>(PassContext);
export const useNoPassContext = () => useNoContext(PassContext);
