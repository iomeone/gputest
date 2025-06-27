import type { LC } from '@use-gpu/live';
import type { OffscreenRenderContext } from '@use-gpu/core';
import type { OverscanOptions, PassBinding, OutlineOptions } from '../../pass/types';

import { use, gather, yeet, memo } from '@use-gpu/live';

//import { useRenderContext } from '../providers/render-provider';
import { RenderTarget } from '../render-target';

export type OutlineBufferProps = {
  overscan?: OverscanOptions,
  outline?: OutlineOptions,
};

export const OUTLINE_EDGE_FORMAT = 'rg8unorm';
export const OUTLINE_RESOLVE_FORMAT = 'rgba8unorm';

export const OutlineBuffer: LC = memo((props: OutlineBufferProps) => {
  const {
    overscan: overscanProp,
  } = props;

  const overscan = overscanProp?.range || 0;
  const edgeFormat = OUTLINE_EDGE_FORMAT;

  const targets = [
    use(RenderTarget, {
      label: 'Outline/Edges',
      sampler: null,
      format: edgeFormat,
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

  depthRamp: 30,
  normalRamp: 15,
};

export const parseOutlineOptions = (opt: boolean | number | Partial<OutlineOptions>) => ({
  ...DEFAULT_OUTLINE_OPTIONS,
  ...(
    opt === true ? {} :
    typeof opt === 'number' ? {inner: opt, outer: opt * 2 + 1} :
    opt
  ),
});
