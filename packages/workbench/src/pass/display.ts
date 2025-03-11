import type { TextureSource } from '@use-gpu/core';
import type { ShaderSource } from '@use-gpu/shader';

import { TYPED_ARRAYS_BITS, TEXTURE_SAMPLE_TYPES, TEXTURE_ARRAY_TYPES } from '@use-gpu/core';
import { wgsl } from '@use-gpu/shader/wgsl';
import { getShader } from '../hooks/useShader';
import { getTextureAccess, getTextureUVToXY } from '../hooks/useRawTextureAccess';

const intShader = wgsl`
@link fn getTexture(uv: vec2<f32>) -> vec4<u32>;
@link fn getNorm() -> f32;

@export fn main(uv: vec2<f32>) -> vec4<f32> {
  let sample = vec4<f32>(getTexture(uv)) * getNorm();
  return vec4<f32>(pow(sample.xyz, vec3<f32>(2.2)), sample.a);
};
`;

const floatShader = wgsl`
@link fn getTexture(uv: vec2<f32>) -> vec4<u32>;

@export fn main(uv: vec2<f32>) -> vec4<f32> {
  let sample = vec4<f32>(getTexture(uv));
  return abs(sample);
};
`;

const multiViewShader = wgsl`
@optional @link fn getTexture1(uv: vec2<f32>) -> vec4<f32> { return vec4<f32>(0.0); };
@optional @link fn getTexture2(uv: vec2<f32>) -> vec4<f32> { return vec4<f32>(0.0); };
@optional @link fn getTexture3(uv: vec2<f32>) -> vec4<f32> { return vec4<f32>(0.0); };
@optional @link fn getTexture4(uv: vec2<f32>) -> vec4<f32> { return vec4<f32>(0.0); };
@optional @link fn getTexture5(uv: vec2<f32>) -> vec4<f32> { return vec4<f32>(0.0); };
@optional @link fn getTexture6(uv: vec2<f32>) -> vec4<f32> { return vec4<f32>(0.0); };
@optional @link fn getTexture7(uv: vec2<f32>) -> vec4<f32> { return vec4<f32>(0.0); };
@optional @link fn getTexture8(uv: vec2<f32>) -> vec4<f32> { return vec4<f32>(0.0); };

@export fn main(uv: vec2<f32>) -> vec4<f32> {
  let i = u32(uv.x * TEXTURES);

  if (i == 0) { return getTexture1(uv); }
  if (i == 1) { return getTexture2(uv); }
  if (i == 2) { return getTexture3(uv); }
  if (i == 3) { return getTexture4(uv); }
  if (i == 4) { return getTexture5(uv); }
  if (i == 5) { return getTexture6(uv); }
  if (i == 6) { return getTexture7(uv); }
  if (i == 7) { return getTexture8(uv); }

  return vec4<f32>(0.0);
}
`;

export const getMultiViewShader = (textures: ShaderSource[], empty?: boolean) => {
  const n = textures.length + +!!empty;
  return getShader(multiViewShader, textures, {TEXTURES: n});
};

export const getDisplayShader = (texture: TextureSource): ShaderSource => {
  const {format, size} = texture;
  
  let f = TEXTURE_SAMPLE_TYPES[format];
  let a = TEXTURE_ARRAY_TYPES[format];

  let t = getTextureUVToXY(getTextureAccess(texture), size);
  if (f === 'f32') {
    return getShader(floatShader, [t])
  }
  else {
    const bits = TYPED_ARRAYS_BITS.get(a);
    const gain = (1 << bits) - 1;
    return getShader(intShader, [t, 1/gain])
  }
};
