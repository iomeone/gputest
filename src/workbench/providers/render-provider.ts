import type { UseRenderingContextGPU } from '@use-gpu/core';
import { makeContext } from '@use-gpu/live';

export const RenderContext = makeContext<UseRenderingContextGPU>(undefined, 'RenderContext');
