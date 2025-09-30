import type { Lazy, LambdaSource, TextureSource, UniformType, VectorLike } from '@use-gpu/core';
import type { ShaderModule, ShaderSource } from '@use-gpu/shader';
import { getTextureSampleType } from '@use-gpu/core';

import { useMemo } from '@use-gpu/live';
import { proxy } from '@use-gpu/core';

import { getLambdaSource } from './useLambdaSource';
import { getShader } from './useShader';
import { getSource } from './useSource';

import { loadTextureLevel } from '@use-gpu/wgsl/texture/level.wgsl';
import { loadTextureIndexLevel } from '@use-gpu/wgsl/texture/level-index.wgsl';
import { textureUVToXY } from '@use-gpu/wgsl/texture/raw.wgsl';
import { textureUVToXYOffset } from '@use-gpu/wgsl/texture/raw-offset.wgsl';

export const useTextureAccess = (
  texture: TextureSource,
  level?: Lazy<number> | ShaderModule | null | string,
  index?: Lazy<number> | ShaderModule | null | string,
): LambdaSource => useMemo(() => getTextureAccess(texture, level, index), [texture, level, index]);

export const getTextureAccess = (
  texture: TextureSource,
  level?: Lazy<number> | ShaderModule | null | string,
  index?: Lazy<number> | ShaderModule | null | string,
): LambdaSource => {
  const l = typeof level === 'string' ? null : level ? getSource({ name: 'level', format: 'u32', args: [] }, level) : null;
  const i = typeof index === 'string' ? null : index ? getSource({ name: 'index', format: 'u32', args: [] }, index) : null;
  const t = proxy(texture, { variant: 'textureLoad', sampler: null, absolute: false });

  const {layout, format, aspect} = texture;
  const type = getTextureSampleType(format, aspect);

  const f = format.match(/depth/) ? type : `vec4<${type}>` as UniformType;
  const isArray = !!layout.match(/array/);

  const iType = typeof index === 'string' ? index : 'u32';
  const lType = typeof level === 'string' ? level : 'u32';
  const args = (isArray ? ['vec2<u32>', lType, iType] : ['vec2<u32>', lType]) as UniformType[];

  let load = getSource({ name: 'textureAccess', format: f, args }, t);
  if (isArray && typeof index !== 'string') load = getShader(loadTextureIndexLevel, [load, i]);
  else if (typeof level !== 'string') load = getShader(loadTextureLevel, [load, l]);

  return getLambdaSource(load, texture);
};

export const useTextureUVToXY = (
  texture: ShaderSource,
  size?: Lazy<VectorLike>,
  offset?: Lazy<VectorLike>,
): LambdaSource => useMemo(() => getTextureUVToXY(texture, size, offset), [texture, size, offset]);

export const getTextureUVToXY = (
  texture: ShaderSource,
  size?: Lazy<VectorLike>,
  offset?: Lazy<VectorLike>,
): LambdaSource => {
  const t = texture as LambdaSource;
  const bound = getShader(offset ? textureUVToXYOffset : textureUVToXY, [texture, size ?? (() => t.size), offset]);
  return getLambdaSource(bound, t);
};
