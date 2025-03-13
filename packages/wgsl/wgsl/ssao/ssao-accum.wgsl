use '@use-gpu/wgsl/codec/normal16'::{ decodeNormal16 };

@link fn loadNormal16(xy: vec2<u32>) -> vec4<u32>;
@link fn loadDepth(xy: vec2<u32>) -> f32;

@link fn loadSample(xy: vec2<u32>) -> vec4<f32>;
@link fn loadMotionXY(xy: vec2<u32>) -> vec2<f32>;
@link fn loadMotionZ(xy: vec2<u32>) -> f32;

@link fn loadLastAccum(xy: vec2<u32>) -> vec4<f32>;

@link fn getUVScale() -> vec2<f32>;
@link fn getUVJitterDelta() -> vec2<f32>;
@link fn getSize() -> vec2<f32>;
@link fn getFrame() -> i32;

const BLEND_ACCUM = 0.125;

fn normalWeight(a: vec3<f32>, b: vec3<f32>) -> f32 {
  return max(0.0, dot(a, b) * 2.0 - 1.0);
}

fn depthWeight(a: f32, b: f32) -> f32 {
  return max(0.0, min(a / (b + 0.0001), b / (a + 0.0001)) * 10.0 - 9.0);
}

@export fn getSSAOAccum(uv: vec2<f32>) -> vec4<f32> {

  let frame = getFrame();
  let size = getSize();

  // Use downsampled + jittered UV directly
  let sampleXY = vec2<i32>(uv * size);

  // Compute flip inside 2x2 quad, alternating even/odd grids
  let dxy = 1 - ((sampleXY + frame) & vec2<i32>(1)) * 2;

  // Sample 2x2 quad
  let xy00 = vec2<u32>(sampleXY);
  let xy10 = vec2<u32>(sampleXY + vec2<i32>(dxy.x, 0));
  let xy01 = vec2<u32>(sampleXY + vec2<i32>(0, dxy.y));
  let xy11 = vec2<u32>(sampleXY + dxy);

  let normal00 = decodeNormal16(loadNormal16(xy00).xy);  
  let normal10 = decodeNormal16(loadNormal16(xy10).xy);  
  let normal01 = decodeNormal16(loadNormal16(xy01).xy);  
  let normal11 = decodeNormal16(loadNormal16(xy11).xy);  

  let depth00 = loadDepth(xy00);
  let depth10 = loadDepth(xy10);
  let depth01 = loadDepth(xy01);
  let depth11 = loadDepth(xy11);

  // Bilateral 2x2 filter
  //let w00 = 1.0;
  //let w10 = normalWeight(normal10, normal00) * depthWeight(depth10, depth00);
  //let w01 = normalWeight(normal01, normal00) * depthWeight(depth01, depth00);
  //let w11 = normalWeight(normal11, normal00) * depthWeight(depth11, depth00);
  //let w = w00 + w10 + w01 + w11;
  //
  //let sample00 = getSample(uv00);
  //let sample10 = getSample(uv10);
  //let sample01 = getSample(uv01);
  //let sample11 = getSample(uv11);

  let sample = getSample(uv);
  //let sample = (sample00 * w00 + sample10 * w10 + sample01 * w01 + sample11 * w11) / w;

  // Sample motion
  let uvMotion = loadMotionXY(sampleXY);
  let zMotion = loadMotionZ(sampleXY);

  // Compute last depth UV/XY (downsampled + jittered)
  let lastUV = uv - uvMotion * getUVScale() - getUVJitterDelta();
  let lastDepth = depth00 - zMotion;

  // Sample and reproject
  let lastFXY = vec2<i32>(lastUV * size - .5);

  let lastXY00 = vec2<u32>(lastFXY);
  let lastXY10 = vec2<u32>(lastFXY + vec2<i32>(1, 0));
  let lastXY01 = vec2<u32>(lastFXY + vec2<i32>(0, 1));
  let lastXY11 = vec2<u32>(lastFXY + vec2<i32>(1));
  
  let lastSample00 = loadLastAccum(lastXY00);
  let lastSample10 = loadLastAccum(lastXY10);
  let lastSample01 = loadLastAccum(lastXY01);
  let lastSample11 = loadLastAccum(lastXY11);

  let lastDepth00 = loadLastAccum(lastXY00);
  let lastDepth10 = loadLastAccum(lastXY10);
  let lastDepth01 = loadLastAccum(lastXY01);
  let lastDepth11 = loadLastAccum(lastXY11);

  let lastAccumDepth = getDepth(lastXY);
  
  

  let outOfBoundsXY = (lastUV < vec2<f32>(0.0)) | (lastUV > vec2<f32>(1.0));
  let outOfBounds = outOfBoundsXY.x | outOfBoundsXY.y;
  
  let blend = mix(BLEND_ACCUM, 1.0, depthWeight(depth00, lastDepth));
  let weight = select(blend, 1.0, outOfBounds);

  // Float [-1..1] encoding for normal, averaged around zero
  let saved = vec4<f32>(sample.xyz * 2.0 - 1.0, sample.a);

  return mix(last, saved, weight);
}
