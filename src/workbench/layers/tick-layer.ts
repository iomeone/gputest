import type { LiveComponent } from '@use-gpu/live';
import type {
  TypedArray, ViewUniforms, DeepPartial, Lazy,
  UniformPipe, UniformType,
  VertexData, RenderPassMode,
} from '@use-gpu/core';
import type { ShaderSource } from '@use-gpu/shader';

import { RawLines } from '../primitives/raw-lines';

import { use, memo, provide, useCallback, useFiber, useMemo, useOne, useState, useResource } from '@use-gpu/live';
import { resolve } from '@use-gpu/core';
import { TransformContext, useTransformContext, DEFAULT_TRANSFORM } from '../providers/transform-provider';
import { useBoundShader } from '../hooks/useBoundShader';
import { useShaderRef } from '../hooks/useShaderRef';

import { getTickPosition } from '@use-gpu/wgsl/instance/vertex/tick.wgsl';
import { getLineSegment } from '@use-gpu/wgsl/geometry/segment.wgsl';

export type TickLayerProps = {
  position?: number[] | TypedArray,
  size?: number,
  width?: number,
  color?: number[] | TypedArray,
  depth?: number,
  zBias?: number,
  base?: number,
  offset?: number[] | TypedArray,
  tangent?: number[] | TypedArray,

  positions?: ShaderSource,
  sizes?: ShaderSource,
  widths?: ShaderSource,
  colors?: ShaderSource,
  depths?: ShaderSource,
  zBiases?: ShaderSource,
  bases?: ShaderSource,
  offsets?: ShaderSource,
  tangents?: ShaderSource,

  join?: 'miter' | 'round' | 'bevel',

  detail?: number,
  count?: Lazy<number>,
  mode?: RenderPassMode | string,
  id?: number,
};

/** Draws tick marks on a scale, oriented along to the local transform at each point. */
export const TickLayer: LiveComponent<TickLayerProps> = memo((props: TickLayerProps) => {
  const {
    position,
    positions,
    color,
    colors,
    size,
    sizes,
    width,
    widths,
    depth,
    depths,
    zBias,
    zBiases,
    offset,
    offsets,
    tangent,
    tangents,
    base,
    bases,
    join,

    count = 1,
    detail = 1,
    mode = 'opaque',
    id = 0,
  } = props;

  const key = useFiber().id;

  const p = useShaderRef(position, positions);
  const o = useShaderRef(offset, offsets);
  const d = useShaderRef(depth, depths);
  const s = useShaderRef(size, sizes);
  const t = useShaderRef(tangent, tangents);
  const b = useShaderRef(base, bases);

  const {transform: xf, differential: xd} = useTransformContext();

  const c = useCallback(() => ((positions as any)?.length ?? resolve(count) ?? 1) * (detail + 1), [positions, count, detail]);

  const defines = useOne(() => ({ LINE_DETAIL: detail }), detail);
  const bound = useBoundShader(getTickPosition, [xf, xd, p, o, d, s, t, b], defines);

  return (
    provide(TransformContext, DEFAULT_TRANSFORM,
      use(RawLines, {
        positions: bound,
        segments: getLineSegment,
        color,
        colors,
        width,
        widths,
        depth,
        depths,
        zBias,
        zBiases,
        join,

        count: c,
        mode,
        id,
      })
    )
  );
}, 'TickLayer');
