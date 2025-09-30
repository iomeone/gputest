@link fn getPosition(i: u32) -> vec4<f32>;
@link fn getCenter() -> vec3<f32>;
@link fn getSize() -> vec3<f32>;

// Transform a unit size impostor (-1..1) to the right dimensions
@export fn getImpostorVertex(i: u32) -> vec4<f32> {
  let p = getPosition(i);
  let c = getCenter();
  let s = getSize();

  return vec4<f32>(p.xyz * s + c, 1.0);
};
