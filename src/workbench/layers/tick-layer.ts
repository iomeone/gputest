import type { LiveComponent } from '../../live';
import type { TypedArray, Lazy } from '../../core';
import type { ShaderSource } from '../../shader';

import { RawLines, RawLinesFlags } from '../primitives/raw-lines';

import { use, memo, provide, useCallback, useOne } from '../../live';
import { resolve } from '../../core';
import { TransformContextProps, TransformContext, useTransformContext, DEFAULT_TRANSFORM } from '../providers/transform-provider';
import { useShader } from '../hooks/useShader';
import { useShaderRef } from '../hooks/useShaderRef';

import { getTickPosition } from '../../wgsl/instance/vertex/tickwgsl';
import { getLineSegment } from '../../wgsl/geometry/segmentwgsl';

export type TickLayerProps = RawLinesFlags & {
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

  instance?: number,
  instances?: ShaderSource,
  transform?: TransformContextProps,

  detail?: number,
  count?: Lazy<number>,
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

    instance,
    instances,
    transform,

    count = 1,
    detail = 1,
    mode = 'opaque',

    ...rest
  } = props;

  const p = useShaderRef(position, positions);
  const o = useShaderRef(offset, offsets);
  const d = useShaderRef(depth, depths);
  const s = useShaderRef(size, sizes);
  const t = useShaderRef(tangent, tangents);
  const b = useShaderRef(base, bases);

  const {transform: xf, differential: xd} = useTransformContext();

  const c = useCallback(() => ((positions as any)?.length ?? resolve(count) ?? 1) * (detail + 1), [positions, count, detail]);

  const defines = useOne(() => ({ TICK_LINE_DETAIL: detail, SEGMENT_LINE_DETAIL: detail }), detail);
  const bound = useShader(getTickPosition, [xf, xd, p, o, d, s, t, b], defines);

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

        instance,
        instances,
        transform,

        count: c,
        mode,

        ...rest
      })
    )
  );
}, 'TickLayer');
