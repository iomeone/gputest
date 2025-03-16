import type { Lazy, LambdaSource, TextureSource, VectorLike } from '@use-gpu/core';
import type { ShaderModule } from '@use-gpu/shader';
import { getTextureSampleType } from '@use-gpu/core';

import { useMemo } from '@use-gpu/live';
import { proxy, resolve } from '@use-gpu/core';

import { getLambdaSource } from './useLambdaSource';
import { getShader } from './useShader';
import { getSource } from './useSource';

import { getUnfiltered, getUnfilteredOffset } from '@use-gpu/wgsl/texture/unfiltered.wgsl';

import { loadTextureLevel } from '@use-gpu/wgsl/texture/level.wgsl';
import { loadTextureIndexLevel } from '@use-gpu/wgsl/texture/level-index.wgsl';
import { textureUVToXY } from '@use-gpu/wgsl/texture/raw.wgsl';
import { textureUVToXYOffset } from '@use-gpu/wgsl/texture/raw-offset.wgsl';

export const useRawTextureAccess = (
  texture: TextureSource,
  offset: Lazy<VectorLike>,
  level: Lazy<number> | ShaderModule = 0,
) => useMemo(() => getRawTextureAccess(texture, offset, level), [texture, offset, level]);

export const getRawTextureAccess = (
  texture: TextureSource,
  offset?: Lazy<VectorLike>,
  level: Lazy<number> | ShaderModule = 0,
) => {
  const s = () => texture.size;
  const b = offset != null ? () => resolve(offset) : null;
  const l = getSource({ name: 'level', format: 'u32', args: ['u32'] }, level);

  const {format, aspect} = texture;
  const type = getTextureSampleType(format, aspect);
  const f = format.match(/depth/) ? type : `vec4<${type}>`;
  const t = getSource({ name: 'texture', format: f, args: ['vec2<u32>', 'u32'] }, texture);

  const bound = getShader(offset != null ? getUnfilteredOffset : getUnfiltered, [t, s, b]);
  return getLambdaSource(bound, texture);
}

export const useTextureAccess = (
  texture: TextureSource,
  level: Lazy<number> | ShaderModule | null,
  index: Lazy<number> | ShaderModule | null,
) => useMemo(() => getTextureAccess(texture, level, index), [texture, level, index]);

export const getTextureAccess = (
  texture: TextureSource,
  level: Lazy<number> | ShaderModule | null,
  index: Lazy<number> | ShaderModule | null,
) => {
  const l = level ? getSource({ name: 'level', format: 'u32', args: [] }, level) : null;
  const i = index ? getSource({ name: 'index', format: 'u32', args: [] }, index) : null;
  const t = proxy(texture, { variant: 'textureLoad', sampler: null });

  const {layout, format, aspect} = texture;
  const type = getTextureSampleType(format, aspect);

  const f = format.match(/depth/) ? type : `vec4<${type}>`;
  const isArray = !!layout.match(/array/);

  const args = isArray ? ['vec2<u32>', 'u32', 'u32'] : ['vec2<u32>', 'u32'];

  let load = getSource({ name: 'textureAccess', format: f, args }, t);
  if (isArray) load = getShader(loadTextureIndexLevel, [load, i]);
  load = getShader(loadTextureLevel, [load, l]);

  return getLambdaSource(load, texture);
};

export const useTextureUVToXY = (
  texture: ShaderSource,
  size?: Lazy<VectorLike>,
  offset?: Lazy<VectorLike>,
) => useMemo(() => getTextureUVToXY(texture, size, offset), [texture, size, offset]);

export const getTextureUVToXY = (
  texture: ShaderSource,
  size?: Lazy<VectorLike>,
  offset?: Lazy<VectorLike>,
) => {
  const bound = getShader(offset ? textureUVToXYOffset : textureUVToXY, [texture, size ?? (() => texture.size), offset]);
  return getLambdaSource(bound, texture);
};
