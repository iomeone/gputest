use '@use-gpu/wgsl/use/picking'::{ getPickingColor };

@stage(fragment)
fn main(
  @location(0) @interpolate(flat) fragIndex: u32,
) -> @location(0) vec4<u32> {
  return getPickingColor(fragIndex);
}

