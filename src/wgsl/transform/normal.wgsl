@link fn getMatrix(i: u32) -> mat4x4<f32>;
@link fn getNormal(i: u32) -> vec4<f32>;

@export fn getTransformedNormal(i: u32) -> vec4<f32> {
  let normal = getNormal(i);
  let rotated = getMatrix(0u) * vec4<f32>(normal.xyz, 0.0);
  return vec4<f32>(rotated.xyz, normal.w);
}
