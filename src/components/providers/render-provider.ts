import { LiveComponent, LiveElement } from '@use-gpu/live/types';

import { memo, provide, makeContext, useMemo } from '@use-gpu/live';
import { CanvasRenderingContextGPU } from '@use-gpu/webgpu/types';

export const RenderContext = makeContext(null, 'RenderContext');

export type RenderProviderProps = {
  renderContext: CanvasRenderingContextGPU,
  children: LiveElement<any>,
};

export const RenderProvider: LiveComponent<RenderProviderProps> = memo((fiber) => (props) => {
  const {renderContext, children} = props;
  return provide(RenderContext, renderContext, children);
}, 'RenderProvider');