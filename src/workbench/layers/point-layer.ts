import type { LiveComponent } from '@use-gpu/live';
import type {
  TypedArray, ViewUniforms, DeepPartial, Lazy,
  UniformPipe, UniformAttribute, UniformAttributeValue, UniformType,
  VertexData, RenderPassMode,
} from '@use-gpu/core';
import type { ShaderSource } from '@use-gpu/shader';
import type { PipelineOptions } from '../hooks/usePipelineOptions';

import { RawQuads } from '../primitives/raw-quads';

import { patch } from '@use-gpu/state';
import { use, memo, useMemo, useOne, useState, useResource } from '@use-gpu/live';
import { bindBundle, bindingToModule, castTo } from '@use-gpu/shader/wgsl';
import { makeShaderBinding, makeShaderBindings } from '@use-gpu/core';
import { useShaderRef } from '../hooks/useShaderRef';
import { useBoundShader } from '../hooks/useBoundShader';

import { circle, diamond, square, circleOutlined, diamondOutlined, squareOutlined } from '@use-gpu/wgsl/mask/point.wgsl';
import { PointShape } from './types';

const MASK_SHADER = {
  'circle': circle,
  'diamond': diamond, 
  'square': square, 
  'circleOutlined': circleOutlined, 
  'diamondOutlined': diamondOutlined, 
  'squareOutlined': squareOutlined, 
};

export type PointLayerProps = {
  position?: number[] | TypedArray,
  uv?: number[] | TypedArray,
  st?: number[] | TypedArray,
  size?: number,
  color?: number[] | TypedArray,
  depth?: number,
  zBias?: number,

  positions?: ShaderSource,
  uvs?: ShaderSource,
  sts?: ShaderSource,
  sizes?: ShaderSource,
  colors?: ShaderSource,
  depths?: ShaderSource,
  zBiases?: ShaderSource,

  shape?: PointShape,
  stroke?: number,

  count?: Lazy<number>,
  id?: number,
} & Pick<Partial<PipelineOptions>, 'mode' | 'depthTest' | 'depthWrite' | 'alphaToCoverage' | 'blend'>;

const SIZE_BINDING = { name: 'getSize', format: 'f32', value: 1, args: ['u32'] } as UniformAttributeValue;

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
    stroke = 0,
    shape = 'circle',
    mode = 'opaque',
    id = 0,

    ...rest
  } = props;

  const s = useShaderRef(size, sizes);

  const rectangles = useOne(() => {
    const getSizeFloat = bindingToModule(makeShaderBinding(SIZE_BINDING, s));
    return castTo(getSizeFloat, 'vec4<f32>', {
      basis: 'xxxx',
      signs: '--++',
      gain: 0.5,
    });
  }, s);
  const mask = (MASK_SHADER as any)[shape] ?? MASK_SHADER.circle;
  const boundMask = useBoundShader(mask, [stroke]);

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
