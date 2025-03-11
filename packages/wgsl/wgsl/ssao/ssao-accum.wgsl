use '@use-gpu/wgsl/codec/normal16'::{ decodeNormal16 };

@link fn loadNormal16(xy: vec2<u32>) -> vec4<u32>;
@link fn loadDepth(xy: vec2<u32>) -> f32;

@link fn loadSample(xy: vec2<u32>) -> vec4<f32>;
@link fn loadMotion(xy: vec2<u32>) -> vec4<f32>;

@link fn loadLastAccum(xy: vec2<u32>) -> vec4<f32>;

@link fn getUVScale() -> vec2<f32>;
@link fn getSize() -> vec2<f32>;
@link fn getFrame() -> i32;

@optional @link fn printData(vector: vec4<f32>) { };

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
  let w00 = 1.0;
  let w10 = normalWeight(normal10, normal00) * depthWeight(depth10, depth00);
  let w01 = normalWeight(normal01, normal00) * depthWeight(depth01, depth00);
  let w11 = normalWeight(normal11, normal00) * depthWeight(depth11, depth00);
  let w = w00 + w10 + w01 + w11;

  // Compute last depth UV/XY (downsampled + jittered)
  let lastUV = uv - loadMotion(sampleXY).xy * getUVScale();
  let lastXY = vec2<i32>(lastUV * size);

  // Sample and reproject
  let lastAccum = loadLastAccum(lastXY);
  let lastDepth = getDepth(lastXY);

  let sample00 = getSample(uv00);
  let sample10 = getSample(uv10);
  let sample01 = getSample(uv01);
  let sample11 = getSample(uv11);

  let sample = getSample(uv);//(sample00 * w00 + sample10 * w10 + sample01 * w01 + sample11 * w11) / w;

  let outOfBoundsXY = (lastUV < vec2<f32>(0.0)) | (lastUV > vec2<f32>(1.0));
  let outOfBounds = outOfBoundsXY.x | outOfBoundsXY.y;
  
  let blend = mix(BLEND_ACCUM, 1.0, depthWeight(depth00, lastDepth));
  let weight = select(blend, 1.0, outOfBounds);

  // Float [-1..1] encoding for normal, averaged around zero
  let saved = vec4<f32>(sample.xyz * 2.0 - 1.0, sample.a);

  return mix(last, saved, weight);
}
