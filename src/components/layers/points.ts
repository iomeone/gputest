import { LiveComponent } from '../../live/types';
import {
  TypedArray, ViewUniforms, DeepPartial,
  UniformPipe, UniformAttribute, UniformAttributeValue, UniformType,
  VertexData, StorageSource, RenderPassMode,
} from '../../core/types';
import { ShaderModule } from '../../shader/types';

import { RawQuads } from '../geometry/raw-quads';

import { use, memo, patch, useFiber, useMemo, useOne, useState, useResource } from '../../live';
import { linkBundle, bindBundle, bindingToModule, bindingsToLinks, resolveBindings, castTo } from '../../shader/glsl';
import { makeShaderBinding, makeShaderBindings } from '../../core';

import { circle, diamond, square, circleOutlined, diamondOutlined, squareOutlined } from '../../gen-glsl/mask/point';

export enum PointShape {
  Circle = 'circle',
  Diamond = 'diamond',
  Square = 'square',
  CircleOutlined = 'circleOutlined',
  DiamondOutlined = 'diamondOutlined',
  SquareOutlined = 'squareOutlined',
};

const MASK_SHADER = {
  [PointShape.Circle]: circle,
  [PointShape.Diamond]: diamond,
  [PointShape.Square]: square,
  [PointShape.CircleOutlined]: circleOutlined,
  [PointShape.DiamondOutlined]: diamondOutlined,
  [PointShape.SquareOutlined]: squareOutlined,
};

export type PointsProps = {
  position?: number[] | TypedArray,
  size?: number,
  color?: number[],
  depth?: number,

  positions?: StorageSource,
  sizes?: StorageSource,
  colors?: StorageSource,
  depths?: StorageSource,

  getPosition?: ShaderModule,
  getSize?: ShaderModule,
  getColor?: ShaderModule,
  getDepth?: ShaderModule,

  shape?: PointShape,

  count?: number,
  mode?: RenderPassMode | string,
  id?: number,
};

const SIZE_BINDING = { name: 'getSize', format: 'float', value: 1, args: ['int'] } as UniformAttributeValue;

export const Points: LiveComponent<PointsProps> = memo((props) => {
  const {
    position,
    positions,
    color,
    colors,
    size,
    sizes,
    depth,
    depths,

    getPosition,
    getSize,
    getColor,
    getDepth,
    
    count,
    shape = PointShape.DiamondOutlined,
    mode = RenderPassMode.Opaque,
    id = 0,
  } = props;

  const key = useFiber().id;

  const s = sizes ?? size ?? getSize;

  const getSizeVec2 = useMemo(() => {
    const getSizeFloat = bindingToModule(makeShaderBinding(SIZE_BINDING, s));
    return castTo(getSizeFloat, 'vec2', 'xx');
  }, [s]);
  const getMask = MASK_SHADER[shape] ?? MASK_SHADER[PointShape.Circle];

  return use(RawQuads)({
    position,
    positions,
    color,
    colors,
    depth,
    depths,

    getPosition,
    getColor,
    getDepth,

    getSize: getSizeVec2,
    getMask,

    count,
    mode,
    id,
  });
}, 'Points');
