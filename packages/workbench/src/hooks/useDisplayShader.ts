import type { TextureSource } from '@use-gpu/core';
import type { ShaderSource } from '@use-gpu/shader';

import { useOne } from '@use-gpu/live';

import { seq, TYPED_ARRAYS_BITS, TEXTURE_SAMPLE_TYPES, TEXTURE_ARRAY_TYPES } from '@use-gpu/core';
import { chainTo } from '@use-gpu/shader/wgsl';
import { getShader } from '../hooks/useShader';
import { getTextureAccess, getTextureUVToXY } from '../hooks/useRawTextureAccess';
import { getLambdaSource } from '../hooks/useLambdaSource';

import { displayDepth } from '@use-gpu/wgsl/display/depth.wgsl';
import { displayFloat } from '@use-gpu/wgsl/display/float.wgsl';
import { displayInt } from '@use-gpu/wgsl/display/int.wgsl';
import { displayMotionXY } from '@use-gpu/wgsl/display/motion-xy.wgsl';
import { displayMotionZ } from '@use-gpu/wgsl/display/motion-z.wgsl';
import { getMultiViewSample } from '@use-gpu/wgsl/display/multiview.wgsl';

const HINT_SHADERS = {
  'depth': displayDepth,
  'motion/xy': displayMotionXY,
  'motion/z': displayMotionZ,
};

export const useMultiViewShader = (textures: ShaderSource[], empty?: boolean) =>
  useMemo(() => getMultiViewShader(textures, empty), [texture, empty]);

export const getMultiViewShader = (textures: ShaderSource[], empty?: boolean) => {
  const n = textures.length + +!!empty;
  return getShader(getMultiViewSample, [n, ...textures]);
};

export const useDisplayShader = (texture: TextureSource) => useOne(() => getDisplayShader(texture), texture);

export const getDisplayShader = (texture: TextureSource): ShaderSource => {
  const {layout, format, size, hint} = texture;
  
  const f = TEXTURE_SAMPLE_TYPES[format];
  const a = TEXTURE_ARRAY_TYPES[format];
  const h = HINT_SHADERS[hint];

  const t = getTextureUVToXY(getTextureAccess(texture), size).shader;
  if (f === 'f32') {
    return getLambdaSource(chainTo(t, h ?? displayFloat), texture);
  }
  else {
    const bits = TYPED_ARRAYS_BITS.get(a);
    const gain = (1 << bits) - 1;
    const s = chainTo(t, getShader(displayInt, [1/gain]));
    return getLambdaSource(h ? chainTo(s, h) : s, texture);
  }
};
