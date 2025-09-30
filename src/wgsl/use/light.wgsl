use '@use-gpu/wgsl/use/types'::{ Light };

struct LightUniforms {
  count: u32,
  lights: array<Light>,
};

@group(PASS) @binding(0) var<storage> lightUniforms: LightUniforms;

@export fn getLightCount() -> u32 { return lightUniforms.count; }
@export fn getLight(index: u32) -> Light { return lightUniforms.lights[index]; }
