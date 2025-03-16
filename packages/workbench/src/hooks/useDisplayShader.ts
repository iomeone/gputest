import type { TextureSource } from '@use-gpu/core';
import type { ShaderSource } from '@use-gpu/shader';

import { useOne } from '@use-gpu/live';

import { seq, getTextureSampleType, getTextureArrayType, getTypedArraysBitCount } from '@use-gpu/core';
import { castTo, chainTo } from '@use-gpu/shader/wgsl';
import { getShader } from '../hooks/useShader';
import { getTextureAccess, getTextureUVToXY } from '../hooks/useRawTextureAccess';
import { getLambdaSource } from '../hooks/useLambdaSource';

import { displayFloat } from '@use-gpu/wgsl/display/float.wgsl';
import { displayInt } from '@use-gpu/wgsl/display/int.wgsl';

import { displayAlpha } from '@use-gpu/wgsl/display/alpha.wgsl';
import { displayDepth } from '@use-gpu/wgsl/display/depth.wgsl';
import { displayMotionXY } from '@use-gpu/wgsl/display/motion-xy.wgsl';
import { displayMotionZ } from '@use-gpu/wgsl/display/motion-z.wgsl';
import { displayPicking } from '@use-gpu/wgsl/display/picking.wgsl';
import { displayStencil } from '@use-gpu/wgsl/display/stencil.wgsl';

import { getMultiViewSample } from '@use-gpu/wgsl/display/multiview.wgsl';

const HINT_SHADERS = {
  'alpha': displayAlpha,
  'depth': displayDepth,
  'motion/xy': displayMotionXY,
  'motion/z': displayMotionZ,
  'picking': displayPicking,
  'stencil': displayStencil,
};

export const useMultiViewShader = (textures: ShaderSource[], empty?: boolean) =>
  useMemo(() => getMultiViewShader(textures, empty), [texture, empty]);

export const getMultiViewShader = (textures: ShaderSource[], empty?: boolean) => {
  const n = textures.length + +!!empty;
  return getShader(getMultiViewSample, [n, ...textures]);
};

export const useDisplayShader = (texture: TextureSource) => useOne(() => getDisplayShader(texture), texture);

export const getDisplayShader = (texture: TextureSource): ShaderSource => {
  const {aspect, layout, format, size, hint} = texture;

  const f = getTextureSampleType(format, aspect);
  const a = getTextureArrayType(format, aspect);
  const h = HINT_SHADERS[hint] ?? inferTextureHint(texture);

  const t = getTextureUVToXY(getTextureAccess(texture), size).shader;
  if (f === 'f32') {
    return getLambdaSource(chainTo(t, h ?? displayFloat), texture);
  }
  else {
    const bits = getTypedArraysBitCount(a);
    const gain = bits < 32 ? (1 << bits) - 1 : 0xffffffff;
    
    const c = aspect === 'stencil-only' ? castTo(t, 'vec4<u32>') : t;
    const s = chainTo(c, getShader(displayInt, [1/gain]));
    return getLambdaSource(h ? chainTo(s, h) : s, texture);
  }
};

const inferTextureHint = (texture: TextureSource) => {
  const {format, aspect} = texture;

  if (format?.match(/depth/)) return 'depth';
  if (aspect?.match(/stencil/)) return 'stencil';

  return null;
};
