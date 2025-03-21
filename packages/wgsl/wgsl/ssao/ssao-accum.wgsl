use '@use-gpu/wgsl/codec/normal16'::{ decodeNormal16 };
use './ssao-weight'::{ normalWeight, depthWeight };

const PREFILTER_SAMPLES = true;
const BILATERAL_REPROJECTION = true;

@link fn loadSample(xy: vec2<u32>) -> vec4<f32>;
@link fn loadMotionXY(xy: vec2<u32>) -> vec2<f32>;
@link fn loadMotionZ(xy: vec2<u32>) -> f32;
@link fn loadLastAccum(xy: vec2<u32>) -> vec4<f32>;

@link fn loadNormal16(xy: vec2<u32>) -> vec4<u32>;
@link fn loadDepth(xy: vec2<u32>) -> f32;
@link fn loadLastNormal16(xy: vec2<u32>) -> vec4<u32>;
@link fn loadLastDepth(xy: vec2<u32>) -> f32;

@link fn getBlend() -> f32;

@link fn getUVScale() -> vec2<f32>;
@link fn getUVJitterDelta() -> vec2<f32>;
@link fn getSize() -> vec2<f32>;
@link fn getFrame() -> i32;

@export fn getSSAOAccum(uv: vec2<f32>) -> vec4<f32> {

  let frame = getFrame();
  let size = getSize();

  // Use downsampled + jittered UV directly
  let sampleXYI = vec2<i32>(uv * size);
  let sampleXY = vec2<u32>(sampleXYI);

  var sample: vec4<f32>;
  var normal: vec3<f32>;
  var depth: f32;

  if (PREFILTER_SAMPLES) {
    // Pre-filter sample within 2x2 quad

    // Compute flip of 2x2 quad, alternating even/odd grids
    let dxy = 1 - (frame & 1) * 2;

    // Sample 2x2 quad with 00 = self
    let xy00 = vec2<u32>(sampleXYI);
    let xy10 = vec2<u32>(sampleXYI + vec2<i32>(dxy, 0));
    let xy01 = vec2<u32>(sampleXYI + vec2<i32>(0, dxy));
    let xy11 = vec2<u32>(sampleXYI + dxy);

    let normal00 = decodeNormal16(loadNormal16(xy00));
    let normal10 = decodeNormal16(loadNormal16(xy10));
    let normal01 = decodeNormal16(loadNormal16(xy01));
    let normal11 = decodeNormal16(loadNormal16(xy11));

    let depth00 = loadDepth(xy00);
    let depth10 = loadDepth(xy10);
    let depth01 = loadDepth(xy01);
    let depth11 = loadDepth(xy11);

    // Bilateral 2x2 filter at w00
    let w00 = 1.0;
    let w10 = normalWeight(normal10, normal00) * depthWeight(depth10, depth00);
    let w01 = normalWeight(normal01, normal00) * depthWeight(depth01, depth00);
    let w11 = normalWeight(normal11, normal00) * depthWeight(depth11, depth00);
    let w = w00 + w10 + w01 + w11;

    let wBilateral = vec4<f32>(w00, w10, w01, w11);
    let wBilateralNorm = wBilateral.x + wBilateral.y + wBilateral.z + wBilateral.w;
    let wBilateralNormed = wBilateral / wBilateralNorm;

    let sample00 = loadSample(xy00);
    let sample10 = loadSample(xy10);
    let sample01 = loadSample(xy01);
    let sample11 = loadSample(xy11);

    sample = mat4x4(
      sample00,
      sample10,
      sample01,
      sample11,
    ) * wBilateralNormed;

    normal = normal00;
    depth = depth00;
  }
  else {
    // Use sample directly
    normal = decodeNormal16(loadNormal16(sampleXY));
    depth = loadDepth(sampleXY);
    sample = loadSample(sampleXY);
  }

  // Sample motion
  let uvMotion = loadMotionXY(sampleXY).xy;
  let zMotion = loadMotionZ(sampleXY).x;

  // Compute last depth UV/XY (downsampled + jittered)
  // getUVScale() deals with odd-sized downsamples which aren't exactly 1/2.
  let lastUV = uv - uvMotion * getUVScale() + getUVJitterDelta();
  let lastExpectedDepth = depth - zMotion;

  // Sample and reproject
  let lastSampleXY = lastUV * size - .5;
  let lastFXY = floor(lastSampleXY);
  let lastDXY = lastSampleXY - lastFXY;
  let lastXY = vec2<u32>(lastFXY);

  var lastSample: vec4<f32>;
  var lastNormal: vec3<f32>;
  var lastDepth: f32;

  {
    let xy00 = lastXY;
    let xy10 = lastXY + vec2<u32>(1, 0);
    let xy01 = lastXY + vec2<u32>(0, 1);
    let xy11 = lastXY + vec2<u32>(1);

    // Bilinear weights
    let dw = lastDXY;
    let dw1 = 1.0 - dw;
    let wBilinear = (
      vec4<f32>(dw1.x, dw.x, dw1.x, dw.x) *
      vec4<f32>(dw1.y, dw1.y, dw.y, dw.y)
    );

    let sample00 = loadLastAccum(xy00);
    let sample10 = loadLastAccum(xy10);
    let sample01 = loadLastAccum(xy01);
    let sample11 = loadLastAccum(xy11);

    let normal00 = decodeNormal16(loadLastNormal16(xy00));
    let normal10 = decodeNormal16(loadLastNormal16(xy10));
    let normal01 = decodeNormal16(loadLastNormal16(xy01));
    let normal11 = decodeNormal16(loadLastNormal16(xy11));

    let depth00 = loadLastDepth(xy00);
    let depth10 = loadLastDepth(xy10);
    let depth01 = loadLastDepth(xy01);
    let depth11 = loadLastDepth(xy11);

    // Bilateral + bilinear reprojection (sharp)
    if (BILATERAL_REPROJECTION) {

      let w00 = normalWeight(normal00, normal) * depthWeight(depth00, lastExpectedDepth);
      let w10 = normalWeight(normal10, normal) * depthWeight(depth10, lastExpectedDepth);
      let w01 = normalWeight(normal01, normal) * depthWeight(depth01, lastExpectedDepth);
      let w11 = normalWeight(normal11, normal) * depthWeight(depth11, lastExpectedDepth);

      // Add epsilon in case all weights are 0
      let wBilateral = mix(vec4<f32>(w00, w10, w01, w11) * wBilinear, vec4<f32>(1.0), 1e-3);
      let wBilateralNorm = wBilateral.x + wBilateral.y + wBilateral.z + wBilateral.w;
      let wBilateralNormed = wBilateral / wBilateralNorm;

      lastSample = mat4x4(
        sample00,
        sample10,
        sample01,
        sample11,
      ) * wBilateralNormed;

      lastDepth = dot(vec4<f32>(
        depth00,
        depth10,
        depth01,
        depth11,
      ), wBilateralNormed);

      lastNormal = mat4x3(
        normal00,
        normal10,
        normal01,
        normal11,
      ) * wBilateralNormed;
    }
    // Bilinear reprojection (blurry)
    else {
      lastSample = mat4x4(
        sample00,
        sample10,
        sample01,
        sample11,
      ) * wBilinear;

      lastDepth = dot(vec4<f32>(
        depth00,
        depth10,
        depth01,
        depth11,
      ), wBilinear);

      lastNormal = mat4x3(
        normal00,
        normal10,
        normal01,
        normal11,
      ) * wBilinear;
    }
  }

  // Clip to edges
  let outOfBoundsXY = (lastUV < vec2<f32>(0.0)) | (lastUV > vec2<f32>(1.0));
  let outOfBounds = outOfBoundsXY.x || outOfBoundsXY.y || frame == 0;

  // Blend weight
  let blendWeight = select(0.0, normalWeight(normal, lastNormal) * depthWeight(lastExpectedDepth, lastDepth), !outOfBounds);
  let accumulateBlend = mix(1.0, getBlend(), blendWeight);

  // Float [-1..1] encoding for normal, averaged around zero
  let newSample = vec4<f32>(sample.xyz * 2.0 - 1.0, sample.a);

  return mix(lastSample, newSample, accumulateBlend);
}
