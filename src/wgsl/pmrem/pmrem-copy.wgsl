use '@use-gpu/wgsl/codec/octahedral'::{ wrapOctahedral, decodeOctahedral };

@link fn getTargetMapping() -> vec4<u32> {};
@link fn getSourceMapping() -> vec4<u32> {};

@link fn getScratchTexture(uv: vec2<f32>, level: f32) -> vec4<f32>;

@link var scratchTexture: texture_storage_2d<rgba16float, write>;
@link var atlasTexture: texture_storage_2d<rgba16float, write>;

@compute @workgroup_size(8, 8)
@export fn pmremCopy(
  @builtin(global_invocation_id) globalId: vec3<u32>,
) {
  let mapping = getTargetMapping();
  let size = mapping.zw - mapping.xy;

  if (any(globalId.xy >= vec2<u32>(size))) { return; }

  let xyi = vec2<u32>(globalId.xy);
  let uv = vec2<f32>(xyi) / vec2<f32>(size - 1);
  let uvo = uv;

  var sample: vec4<f32>;
  {
    let mapping = getSourceMapping();
    let size = mapping.zw - mapping.xy;

    let uv2 = uvo * vec2<f32>(size - 1) + 0.5;
    sample = getScratchTexture(uv2, 0.0);
  }

  textureStore(atlasTexture, xyi + mapping.xy, sample);
  textureStore(scratchTexture, xyi, sample);
}
