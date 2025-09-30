use '@use-gpu/wgsl/codec/octahedral'::{ wrapOctahedral, encodeOctahedral, decodeOctahedral };

@link fn getTargetMapping() -> vec4<u32> {};
@link fn getSourceMapping() -> vec4<u32> {};

@link fn getSigma() -> f32 {};
@link fn getSamples() -> i32 {};

@link fn getScratchTexture(uv: vec2<f32>, level: f32) -> vec4<f32>;

@link var scratchTexture: texture_storage_2d<rgba16float, write>;
@link var atlasTexture: texture_storage_2d<rgba16float, write>;

@compute @workgroup_size(8, 8)
@export fn pmremBlur(
  @builtin(global_invocation_id) globalId: vec3<u32>,
) {
  let mapping = getTargetMapping();
  let size = mapping.zw - mapping.xy;

  if (any(globalId.xy >= vec2<u32>(size))) { return; }

  let xyi = vec2<u32>(globalId.xy);
  let uv = vec2<f32>(xyi) / vec2<f32>(size - 1);
  let uvo = (uv * 2.0 - 1.0);

  var sample: vec4<f32>;
  if (BLUR_PASS == 0) {
    let mapping = getSourceMapping();
    let size = mapping.zw - mapping.xy;

    let uv2 = uv * vec2<f32>(size - 1) + 0.5;
    sample = getScratchTexture(uv2, 0.0);
  }
  else {
    let mapping = getSourceMapping();
    let size = mapping.zw - mapping.xy;

    let sigma = getSigma();
    let samples = getSamples();

    // Separate into X/Y/Z passes
    var on: vec3<f32>;
    if (BLUR_PASS == 1) { on = vec3<f32>(1.0, 0.0, 0.0); }
    if (BLUR_PASS == 2) { on = vec3<f32>(0.0, 1.0, 0.0); }
    if (BLUR_PASS == 3) { on = vec3<f32>(0.0, 0.0, 1.0); }

    let ray = decodeOctahedral(uv * 2.0 - 1.0);
    let axis = cross(ray, on);

    // Project variance onto tangent plane
    let proj = length(cross(ray, on));
    let dn = SIGMA_CUTOFF / f32(samples - 1);
    let dr = proj * sigma;

    var accum: vec4<f32> = vec4<f32>(0.0);
    var weight = 0.0;
    for (var i = 0; i < MAX_SAMPLES; i++) {
      if (i >= samples) { break; }

      let f = (f32(i) + .5) * dn;
      let r = f * dr;
      let w = exp(-sqr(f) / 2.0);

      // Axis-angle rotation +/- r radians
      let c = cos(r);
      let s = sin(r);
      let crossS = cross(ray, axis) * s;
      let dir = mix(axis * dot(axis, ray), ray, c);
      let dir1 = dir + crossS;
      let dir2 = dir - crossS;

      let uvl = encodeOctahedral(dir1) * .5 + .5;
      let uvr = encodeOctahedral(dir2) * .5 + .5;

      let uvls = uvl * vec2<f32>(size - 1) + 0.5;
      let uvrs = uvr * vec2<f32>(size - 1) + 0.5;

      accum += w * getScratchTexture(uvls, 0.0);
      accum += w * getScratchTexture(uvrs, 0.0);
      weight += w * 2.0;
    }
    sample = accum / weight;
  }

  if (BLUR_PASS == 3) { textureStore(atlasTexture, xyi + mapping.xy, sample); }
  textureStore(scratchTexture, xyi, sample);
}

fn sqr(x: f32) -> f32 { return x * x; }

fn rotateAxisAngle(v: vec3<f32>, k: vec3<f32>, theta: f32) -> vec3<f32> {
  let c = cos(theta);
  let s = sin(theta);
  return v * c + cross(k, v) * s + k * dot(k, v) * (1.0 - c);
}
