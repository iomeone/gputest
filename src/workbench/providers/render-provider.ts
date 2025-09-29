import type { UseGPURenderContext } from '@use-gpu/core';
import { makeContext, useContext, useNoContext } from '@use-gpu/live';

export const RenderContext = makeContext<UseGPURenderContext>(undefined, 'RenderContext');

export const useRenderContext = () => useContext(RenderContext);
export const useNoRenderContext = () => useNoContext(RenderContext);
