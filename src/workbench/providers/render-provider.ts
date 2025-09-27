import type { UseRenderingContextGPU } from '../../core';
import { makeContext } from '../../live';

export const RenderContext = makeContext<UseRenderingContextGPU>(undefined, 'RenderContext');
