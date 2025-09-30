use '@use-gpu/wgsl/geometry/strip'::{ getStripIndex };
use '@use-gpu/wgsl/use/array'::{ sizeToModulus3, packIndex3, unpackIndex3 }
use '@use-gpu/wgsl/plot/loop'::{ loopSurface };

@link fn getSize() -> vec3<u32> {};

// Index an [x,y] x [x+1,y+1] quad on a surface
@export fn getSurfaceIndex(index: u32) -> u32 {
  let vertex = index % 6u;
  let instance = index / 6u;
  let s = getSize();

  var dx = 1u;
  var dy = 1u;
  if (LOOP_X) { dx = 0u; }
  if (LOOP_Y) { dy = 0u; }

  // Modulus for grid of quads (n - 1 unless looped)
  let size = s - vec3<u32>(dx, dy, 0u);
  let modulus = sizeToModulus3(size.xyz);

  var xy = getStripIndex(vertex - (vertex / 3u) * 2u);
  if (vertex < 3u) { xy = xy.yx; }

  let xyd = loopSurface(unpackIndex3(instance, modulus), s, vec2<i32>(xy));

  // Modulus for grid of vertices (n)
  return packIndex3(xyd, sizeToModulus3(s.xyz));
}

@export fn getSurfaceUV(index: u32) -> vec4<f32> {
  let size = getSize();
  let modulus = sizeToModulus3(size);

  let xyd = unpackIndex3(index, modulus);
  return vec4<f32>(vec3<f32>(xyd) / vec3<f32>(size - 1), 0.0);
}
