use '@use-gpu/wgsl/geometry/strip'::{ getStripIndex };
use '@use-gpu/wgsl/use/array'::{ sizeToModulus3, packIndex3, unpackIndex3 }
use '@use-gpu/wgsl/plot/loop'::{ loopSurface };

@link fn getSize() -> vec3<u32> {};
@optional @link fn getPosition(index: u32) -> vec4<f32> { return vec4<f32>(0.0, 0.0, 0.0, 0.0); }

@export fn getSurfaceNormal(index: u32) -> vec4<f32> {
  let size = getSize();
  let modulus = sizeToModulus3(size);

  let xyd = unpackIndex3(index, modulus);

  let left   = packIndex3(loopSurface(xyd, size, vec2<i32>(-1, 0)), modulus);
  let right  = packIndex3(loopSurface(xyd, size, vec2<i32>(1, 0)), modulus);
  let top    = packIndex3(loopSurface(xyd, size, vec2<i32>(0, -1)), modulus);
  let bottom = packIndex3(loopSurface(xyd, size, vec2<i32>(0, 1)), modulus);

  let dx = getPosition(right) - getPosition(left);
  let dy = getPosition(bottom) - getPosition(top);

  let normal = vec4<f32>(normalize(cross(dx.xyz, dy.xyz)), 0.0);
  return normal;
}
