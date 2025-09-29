import type { UseGPURenderContext } from '../../core';
import { makeContext, useContext, useNoContext } from '../../live';

export const RenderContext = makeContext<UseGPURenderContext>(undefined, 'RenderContext');

export const useRenderContext = () => useContext(RenderContext);
export const useNoRenderContext = () => useNoContext(RenderContext);
