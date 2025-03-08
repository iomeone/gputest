use '@use-gpu/wgsl/codec/normal16'::{ decodeNormal16 };

@link fn getNormal16(uv: vec2<f32>) -> vec4<u32>;
@link fn getDepth(uv: vec2<f32>) -> f32;

@link fn getSample(uv: vec2<f32>) -> vec4<f32>;
@link fn getMotion(uv: vec2<f32>) -> vec4<f32>;

@link fn getLastAccum(uv: vec2<f32>) -> vec4<f32>;

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

  let f = getFrame();
  let ij = vec2<i32>(uv * getSize());
  let duv = vec2<f32>(1 - ((ij + f) & vec2<i32>(1)) * 2) / getSize();

  let uv00 = uv;
  let uv10 = uv + vec2<f32>(duv.x, 0.0);
  let uv01 = uv + vec2<f32>(0.0, duv.y);
  let uv11 = uv + duv;

  let normal00 = decodeNormal16(getNormal16(uv00).xy);  
  let normal10 = decodeNormal16(getNormal16(uv10).xy);  
  let normal01 = decodeNormal16(getNormal16(uv01).xy);  
  let normal11 = decodeNormal16(getNormal16(uv11).xy);  

  let depth00 = getDepth(uv00);  
  let depth10 = getDepth(uv10);  
  let depth01 = getDepth(uv01);  
  let depth11 = getDepth(uv11);  

  let w00 = 1.0;
  let w10 = normalWeight(normal10, normal00) * depthWeight(depth10, depth00);
  let w01 = normalWeight(normal01, normal00) * depthWeight(depth01, depth00);
  let w11 = normalWeight(normal11, normal00) * depthWeight(depth11, depth00);
  let w = w00 + w10 + w01 + w11;

  let lastUV = uv - getMotion(uv).xy;
  let last = getLastAccum(lastUV);
  //let lastDepth = getDepth(lastUV);

  let sample00 = getSample(uv00);
  let sample10 = getSample(uv10);
  let sample01 = getSample(uv01);
  let sample11 = getSample(uv11);
  let sample = sample00;//(sample00 * w00 + sample10 * w10 + sample01 * w01 + sample11 * w11) / w;

  let outOfBoundsXY = (lastUV < vec2<f32>(0.0)) | (lastUV > vec2<f32>(1.0));
  let outOfBounds = outOfBoundsXY.x | outOfBoundsXY.y;
  
  let blend = BLEND_ACCUM;//mix(BLEND_ACCUM, 1.0, depthWeight(depth00, lastDepth));
  let weight = select(blend, 1.0, outOfBounds);

  // Float [-1..1] encoding for normal, averaged around zero
  let saved = vec4<f32>(sample.xyz * 2.0 - 1.0, sample.a);

  return mix(last, saved, weight);
}
