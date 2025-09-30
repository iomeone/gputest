import type { LiveComponent } from '@use-gpu/live';
import type { Lazy, UniformAttribute, VectorLike } from '@use-gpu/core';
import type { PointShape } from '@use-gpu/parse';
import type { ShaderSource } from '@use-gpu/shader';
import type { PipelineOptions } from '../hooks/usePipelineOptions';

import { RawQuads } from '../primitives/raw-quads';

import { use, memo, useMemo } from '@use-gpu/live';
import { castTo } from '@use-gpu/shader/wgsl';
import { useShaderRef } from '../hooks/useShaderRef';
import { useShader } from '../hooks/useShader';
import { useSource } from '../hooks/useSource';

import { circleSDF, diamondSDF, squareSDF, upSDF, downSDF, leftSDF, rightSDF } from '@use-gpu/wgsl/mask/sdf.wgsl';
import { getFilledMask, getOutlinedMask } from '@use-gpu/wgsl/mask/point.wgsl';

const MASK_SHADER = {
  'circle': circleSDF,
  'diamond': diamondSDF,
  'square': squareSDF,
  'up': upSDF,
  'down': downSDF,
  'left': leftSDF,
  'right': rightSDF,
};

export type PointLayerFlags = {
  shape?: PointShape,
  hollow?: boolean,
  outline?: number,
} & Pick<Partial<PipelineOptions>, 'mode' | 'depthTest' | 'depthWrite' | 'alphaToCoverage' | 'blend'>;

export type PointLayerProps = {
  position?: VectorLike,
  uv?: VectorLike,
  st?: VectorLike,
  size?: number,
  color?: VectorLike,
  depth?: number,
  zBias?: number,

  positions?: ShaderSource,
  uvs?: ShaderSource,
  sts?: ShaderSource,
  sizes?: ShaderSource,
  colors?: ShaderSource,
  depths?: ShaderSource,
  zBiases?: ShaderSource,

  count?: Lazy<number>,
  id?: number,
} & PointLayerFlags;

const SIZE_BINDING = { name: 'getSize', format: 'f32', value: 1, args: ['u32'] } as UniformAttribute;

/** Draws 2D points with choice of shape. */
export const PointLayer: LiveComponent<PointLayerProps> = memo((props: PointLayerProps) => {
  const {
    position,
    positions,
    uv,
    uvs,
    st,
    sts,
    color,
    colors,
    size,
    sizes,
    depth,
    depths,
    zBias,
    zBiases,

    count,
    hollow = false,
    outline = 0,
    shape = 'circle',
    mode = 'opaque',
    id,

    ...rest
  } = props;

  const s = useShaderRef(size, sizes);
  const o = useShaderRef(outline);

  const getSize = useSource(SIZE_BINDING, s ?? 1);

  const rectangles = useMemo(() => {
    return castTo(getSize, 'vec4<f32>', {
      basis: 'xxxx',
      signs: '--++',
      gain: 0.5,
    });
  }, [s, getSize]);

  const sdf = (MASK_SHADER as any)[shape] ?? MASK_SHADER.circle;
  const mask = hollow ? getOutlinedMask : getFilledMask;
  const boundMask = useShader(mask, [sdf, o]);

  return use(RawQuads, {
    position,
    positions,
    uv,
    uvs,
    st,
    sts,
    color,
    colors,
    depth,
    depths,
    zBias,
    zBiases,

    rectangles,
    masks: boundMask,

    ...rest,
    alphaToCoverage: rest.alphaToCoverage ?? true,

    count,
    mode,
    id,
  });
}, 'PointLayer');
