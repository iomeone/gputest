use '@use-gpu/wgsl/codec/normal16'::{ decodeNormal16 };
use './ssao-weight'::{ normalWeight, depthWeight };

@link fn getTargetNormal16(uv: vec2<f32>) -> vec4<u32>;
@link fn getTargetDepth(uv: vec2<f32>) -> f32;

@link fn loadNormal16(xy: vec2<u32>) -> vec4<u32>;
@link fn loadDepth(xy: vec2<u32>) -> f32;
@link fn loadSample(xy: vec2<u32>) -> vec4<f32>;

@link fn getOverscanScale() -> vec2<f32>;

@link fn getSize() -> vec2<f32>;
@link fn getXYJitter() -> vec2<u32>;


const EPS = 1e-6;

@export fn getSSAOResolve(targetUV: vec2<f32>) -> vec4<f32> {

  let overscanUV = targetUV * getOverscanScale() + (1.0 - getOverscanScale()) * .5;

  let targetDepth = getTargetDepth(overscanUV);
  let targetNormal = decodeNormal16(getTargetNormal16(overscanUV).xy);

  let sampleXY = overscanUV * getSize() - .5;
  let fxy = floor(sampleXY);
  let dxy = sampleXY - fxy;
  let xy = vec2<u32>(sampleXY);

  let xy00 = xy;
  let xy10 = xy + vec2<u32>(1, 0);
  let xy01 = xy + vec2<u32>(0, 1);
  let xy11 = xy + vec2<u32>(1);

  let normal00 = decodeNormal16(loadNormal16(xy00).xy);
  let normal10 = decodeNormal16(loadNormal16(xy10).xy);
  let normal01 = decodeNormal16(loadNormal16(xy01).xy);
  let normal11 = decodeNormal16(loadNormal16(xy11).xy);

  let depth00 = loadDepth(xy00);
  let depth10 = loadDepth(xy10);
  let depth01 = loadDepth(xy01);
  let depth11 = loadDepth(xy11);

  let w00 = normalWeight(normal00, targetNormal) * depthWeight(depth00, targetDepth);
  let w10 = normalWeight(normal10, targetNormal) * depthWeight(depth10, targetDepth);
  let w01 = normalWeight(normal01, targetNormal) * depthWeight(depth01, targetDepth);
  let w11 = normalWeight(normal11, targetNormal) * depthWeight(depth11, targetDepth);
  let w = w00 + w10 + w01 + w11;

  let sample00 = loadSample(xy00);
  let sample10 = loadSample(xy10);
  let sample01 = loadSample(xy01);
  let sample11 = loadSample(xy11);

  let sample = mat4x4(
    sample00,
    sample10,
    sample01,
    sample11,
  ) * (vec4<f32>(w00, w10, w01, w11) / w);

  // Unorm [0..1] encoding for normal
  return vec4<f32>(vec3<f32>(normalize(sample.rgb) * .5 + .5), sample.a);
}
