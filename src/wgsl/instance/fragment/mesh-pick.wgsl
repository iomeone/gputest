use '@use-gpu/wgsl/use/picking'::{ getPickingColor }

//@group(1) @binding(0) var s: sampler;
//@group(1) @binding(1) var t: texture_2d<f32>;

struct FragmentOutput {
  @location(0) outColor: vec4<u32>;
};

@stage(fragment)
fn main(
  @location(0) @interpolate(flat) fragIndex: u32,
) -> FragmentOutput {
  var outColor = getPickingColor(fragIndex);

  return FragmentOutput(outColor);
}
