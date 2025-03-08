import type { Lazy, TextureSource, VectorLike } from '@use-gpu/core';
import type { ShaderModule } from '@use-gpu/shader';
import { TEXTURE_SAMPLE_TYPES } from '@use-gpu/core';

import { useMemo } from '@use-gpu/live';
import { resolve } from '@use-gpu/core';

import { getLambdaSource } from './useLambdaSource';
import { getShader } from './useShader';
import { getSource } from './useSource';

import { getUnfiltered, getUnfilteredOffset } from '@use-gpu/wgsl/mask/unfiltered.wgsl';

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

  const {format} = texture;
  const type = TEXTURE_SAMPLE_TYPES[format];
  const f = format.match(/depth/) ? type : `vec4<${type}>`;
  const t = getSource({ name: 'texture', format: f, args: ['vec2<u32>', 'u32'] }, texture);

  const bound = getShader(offset != null ? getUnfilteredOffset : getUnfiltered, [t, s, b]);
  return getLambdaSource(bound, texture);
}