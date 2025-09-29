import type { LC } from '@use-gpu/live';
import type { TextureSource } from '@use-gpu/core';
import type { ParsedEffect } from './types';
import type { ColorLike } from '@use-gpu/traits';

import { memo, use, useOne, useMemo } from '@use-gpu/live';
import { useBoundShader, useCombinedTransform, useLayoutContext, usePipelineOptions, useShaderRef, UIRectangles, Virtual } from '@use-gpu/workbench';
import { getBundleKey } from '@use-gpu/shader/wgsl';

import { usePresentTransition } from './hooks';

import { transformRectangle } from '@use-gpu/wgsl/layout/rectangle.wgsl';

import { getScreenVertex } from '@use-gpu/wgsl/present/screen.wgsl';
import { getScreenFragment } from '@use-gpu/wgsl/present/fragment.wgsl';

export type ScreenProps = {
  id: number,
  texture: TextureSource,
  effect: ParsedEffect,
  fill: ColorLike,
  mode: 'opaque' | 'transparent',
  initial?: number,
};

export const Screen: LC<ScreenProps> = memo((props: ScreenProps) => {
  const {
    id,
    texture,
    effect,
    fill,
    initial,
    mode = 'transparent',
  } = props;

  const layout = useLayoutContext();
  const {useUpdateTransition, transform, mask} = usePresentTransition(id, layout, effect, effect, initial);
  useUpdateTransition();

  const vertexCount = 4;
  const instanceCount = 1;

  const r = useShaderRef(layout);
  const f = useShaderRef(fill);

  const {transform: xf} = useCombinedTransform();

  const getVertex = useBoundShader(getScreenVertex, [r, f, transform, xf]);
  const getFragment = useBoundShader(getScreenFragment, [texture, mask]);

  const links = useOne(() => ({getVertex, getFragment}),
    getBundleKey(getVertex) + getBundleKey(getFragment));

  const [pipeline, defs] = usePipelineOptions({
    mode,
    topology: 'triangle-strip',
    stripIndexFormat: 'uint16',
    side: 'both',
    alphaToCoverage: false,
    depthTest: false,
    depthWrite: false,
  });

  const defines: Record<string, any> = useMemo(() => ({
    ...defs,
    HAS_MASK: !!mask,
  }), [defs, mask]);

  return use(Virtual, {
    vertexCount,
    instanceCount,

    links,
    defines,

    renderer: 'solid',
    pipeline,
    mode,
  });
}, 'Screen');
