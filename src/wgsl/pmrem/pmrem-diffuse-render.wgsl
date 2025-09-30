use '@use-gpu/wgsl/codec/octahedral'::{ decodeOctahedral };

@link fn getTargetMapping() -> vec4<u32> {};

@link var<storage> shCoefficients: array<vec4<f32>>;
@link var atlasTexture: texture_storage_2d<rgba16float, write>;

@compute @workgroup_size(8, 8)
@export fn pmremDiffuseRender(
  @builtin(global_invocation_id) globalId: vec3<u32>,
) {
  let mapping = getTargetMapping();
  let size = mapping.zw - mapping.xy;

  if (any(globalId.xy >= vec2<u32>(size))) { return; }

  let xyi = vec2<u32>(globalId.xy);
  let uv = vec2<f32>(xyi) / vec2<f32>(size - 1);
  let ray = decodeOctahedral(uv * 2.0 - 1.0);

  let sample = (
    shCoefficients[0] +
    shCoefficients[1] * ray.y +
    shCoefficients[2] * ray.z +
    shCoefficients[3] * ray.x +
    shCoefficients[4] * ray.y * ray.x +
    shCoefficients[5] * ray.y * ray.z +
    shCoefficients[6] * (3.0 * sqr(ray.z) - 1.0) +
    shCoefficients[7] * ray.x * ray.z +
    shCoefficients[8] * (sqr(ray.x) - sqr(ray.y))
  );

  textureStore(atlasTexture, xyi + mapping.xy, sample);
}

fn sqr(x: f32) -> f32 { return x * x; }
