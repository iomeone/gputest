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
  level?: Lazy<number> | ShaderModule | null,
  index?: Lazy<number> | ShaderModule | null,
): LambdaSource => useMemo(() => getTextureAccess(texture, level, index), [texture, level, index]);

export const getTextureAccess = (
  texture: TextureSource,
  level?: Lazy<number> | ShaderModule | null,
  index?: Lazy<number> | ShaderModule | null,
): LambdaSource => {
  const l = level ? getSource({ name: 'level', format: 'u32', args: [] }, level) : null;
  const i = index ? getSource({ name: 'index', format: 'u32', args: [] }, index) : null;
  const t = proxy(texture, { variant: 'textureLoad', sampler: null });

  const {layout, format, aspect} = texture;
  const type = getTextureSampleType(format, aspect);

  const f = format.match(/depth/) ? type : `vec4<${type}>` as UniformType;
  const isArray = !!layout.match(/array/);

  const args = (isArray ? ['vec2<u32>', 'u32', 'u32'] : ['vec2<u32>', 'u32']) as UniformType[];

  let load = getSource({ name: 'textureAccess', format: f, args }, t);
  if (isArray) load = getShader(loadTextureIndexLevel, [load, i]);
  load = getShader(loadTextureLevel, [load, l]);

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
