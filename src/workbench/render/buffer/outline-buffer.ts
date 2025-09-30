import type { LC } from '../../../live';
import type { OffscreenRenderContext } from '../../../core';
import type { OutlineOptions } from '../../pass/types';

import { use, gather, yeet, memo } from '../../../live';

//import { useRenderContext } from '../providers/render-provider';
import { RenderTarget } from '../render-target';

export const OUTLINE_EDGE_FORMAT = 'rg8unorm';
export const OUTLINE_SHIFT_FORMAT = 'rg8unorm';
export const OUTLINE_EXPAND_FORMAT = 'rgba8unorm';

export const OutlineBuffer: LC = memo(() => {

  const targets = [
    use(RenderTarget, {
      label: 'Outline/Edges',
      sampler: null,
      format: OUTLINE_EDGE_FORMAT,
      depthStencil: null,
      colorSpace: 'linear',
    }),
  ];

  return gather(targets, (targets: OffscreenRenderContext[]) => {
    return yeet({
      buffers: { outline: targets },
    });
  });
}, 'OutlineBuffer');

export const DEFAULT_OUTLINE_OPTIONS = {
  inner: 1,
  outer: 2,
  color: [0, 0, 0, 1],

  depthRamp: 50,
  normalRamp: 20,
};

export const parseOutlineOptions = (opt: boolean | number | Partial<OutlineOptions>) => ({
  ...DEFAULT_OUTLINE_OPTIONS,
  ...(
    opt === true ? {} :
    typeof opt === 'number' ? {inner: opt, outer: opt * 2 + 1} :
    opt
  ),
});
