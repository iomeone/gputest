use '@use-gpu/wgsl/codec/normal16'::{ decodeNormal16 };

@link fn getTargetNormal16(uv: vec2<f32>) -> vec4<u32>;
@link fn getTargetDepth(uv: vec2<f32>) -> f32;

@link fn loadNormal16(uv: vec2<f32>) -> vec4<u32>;
@link fn loadDepth(uv: vec2<f32>) -> f32;
@link fn loadSample(xy: vec2<u32>) -> vec4<f32>;

@link fn getTargetSize() -> vec2<f32>;
@link fn getSize() -> vec2<f32>;

@link fn getDownscaleOffset() -> vec2<f32>;

const EPS = 1e-6;

fn normalWeight(a: vec3<f32>, b: vec3<f32>) -> f32 {
  return max(EPS, dot(a, b) * 6.0 - 5.0);
}

fn depthWeight(a: f32, b: f32) -> f32 {
  let aa = a + EPS;
  let bb = b + EPS;
  return max(EPS, min(aa / bb, bb / aa) * 10.0 - 9.0);
}

@export fn getSSAOResolve(targetUV: vec2<f32>) -> vec4<f32> {

  let targetDepth = getTargetDepth(targetUV);
  let targetNormal = decodeNormal16(getTargetNormal16(targetUV).xy);

  let targetSize = getTargetSize();
  let size = getSize();

  let o = getDownscaleOffset();
  let xy = ((targetUV + o) * size) - .5;
  let fxy = floor(xy);
  let dxy = xy - fxy;
  
  let ij = vec2<u32>(xy);

  let ij00 = ij;
  let ij10 = ij + vec2<u32>(1, 0);
  let ij01 = ij + vec2<u32>(0, 1);
  let ij11 = ij + vec2<u32>(1);

  let normal00 = decodeNormal16(loadNormal16(ij00).xy);  
  let normal10 = decodeNormal16(loadNormal16(ij10).xy);  
  let normal01 = decodeNormal16(loadNormal16(ij01).xy);  
  let normal11 = decodeNormal16(loadNormal16(ij11).xy);  

  let depth00 = loadDepth(ij00);
  let depth10 = loadDepth(ij10);
  let depth01 = loadDepth(ij01);
  let depth11 = loadDepth(ij11);

  let w00 = normalWeight(normal00, targetNormal) * depthWeight(depth00, targetDepth);
  let w10 = normalWeight(normal10, targetNormal) * depthWeight(depth10, targetDepth);
  let w01 = normalWeight(normal01, targetNormal) * depthWeight(depth01, targetDepth);
  let w11 = normalWeight(normal11, targetNormal) * depthWeight(depth11, targetDepth);

  let w = w00 + w10 + w01 + w11;

  let sample00 = loadSample(ij00);
  let sample10 = loadSample(ij10);
  let sample01 = loadSample(ij01);
  let sample11 = loadSample(ij11);
  let sample = (sample00 * w00 + sample10 * w10 + sample01 * w01 + sample11 * w11) / w;

  let targetSample = loadSample(ij);
  if (targetUV.x < 0.25) { return vec4<f32>(targetNormal * .5 + .5, 1.0); }
  if (targetUV.x < 0.5) { return vec4<f32>(targetSample.xyz * .5 + .5, targetSample.a); }

  // Unorm [0..1] encoding for normal
  return vec4<f32>(vec3<f32>(normalize(sample.rgb) * .5 + .5), sample.a);
}
