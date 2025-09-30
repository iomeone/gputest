import type { LambdaSource, TextureSource } from '../../core';
import type { ShaderSource } from '../../shader';

import { useMemo, useOne } from '../../live';

import { getTextureSampleType, getTextureArrayType, getTypedArraysBitCount } from '../../core';
import { castTo, chainTo } from '../../shader/wgsl';
import { getShader } from '../hooks/useShader';
import { getTextureAccess, getTextureUVToXY } from '../hooks/useTextureAccess';
import { getLambdaSource } from '../hooks/useLambdaSource';

import { displayFloat } from '../../wgsl/display/floatwgsl';
import { displayInt } from '../../wgsl/display/intwgsl';

import { displayAlpha } from '../../wgsl/display/alphawgsl';
import { displayDepth } from '../../wgsl/display/depthwgsl';
import { displayMotionXY } from '../../wgsl/display/motion-xywgsl';
import { displayMotionZ } from '../../wgsl/display/motion-zwgsl';
import { displayPicking } from '../../wgsl/display/pickingwgsl';
import { displayRGB } from '../../wgsl/display/rgbwgsl';
import { displayStencil } from '../../wgsl/display/stencilwgsl';

import { getMultiViewSample } from '../../wgsl/display/multiviewwgsl';

const HINT_SHADERS = {
  'alpha': displayAlpha,
  'depth': displayDepth,
  'motion/xy': displayMotionXY,
  'motion/z': displayMotionZ,
  'picking': displayPicking,
  'rgb': displayRGB,
  'stencil': displayStencil,
};

export const useMultiViewShader = (textures: (ShaderSource | null | undefined)[], empty?: boolean) =>
  useMemo(() => getMultiViewShader(textures, empty), [textures, empty]);

export const getMultiViewShader = (textures: (ShaderSource | null | undefined)[], empty?: boolean) => {
  const n = textures.length + +!!empty;
  return getShader(getMultiViewSample, [n, ...textures]);
};

export const useDisplayShader = (texture: TextureSource) => useOne(() => getDisplayShader(texture), texture);

export const getDisplayShader = (texture: TextureSource): LambdaSource => {
  const {aspect, format, size, hint} = texture;

  const f = getTextureSampleType(format, aspect);
  const a = getTextureArrayType(format, aspect);
  const h = (HINT_SHADERS as any)[hint as string] ?? HINT_SHADERS[inferTextureHint(texture)];

  const t = getTextureUVToXY(getTextureAccess(texture), size).shader;
  if (f === 'f32') {
    return getLambdaSource(chainTo(t, h ?? displayFloat), texture);
  }
  else {
    const bits = getTypedArraysBitCount(a) ?? 1;
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

  return 'rgb';
};
