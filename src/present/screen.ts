import type { LC } from '../live';
import type { TextureSource } from '../core';
import type { ParsedEffect } from './types';
import type { ColorLike } from '../traits';

import { memo, use, useOne, useMemo } from '../live';
import { useBoundShader, useCombinedTransform, useLayoutContext, usePipelineOptions, useShaderRef, UIRectangles, Virtual } from '../workbench';
import { getBundleKey } from '../shader/wgsl';

import { usePresentTransition } from './hooks';

import { transformRectangle } from '../wgsl/layout/rectanglewgsl';

import { getScreenVertex } from '../wgsl/present/screenwgsl';
import { getScreenFragment } from '../wgsl/present/fragmentwgsl';

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
