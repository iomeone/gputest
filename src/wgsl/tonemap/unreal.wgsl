// Unreal 3, Documentation: "Color Grading"
// Adapted to be close to Tonemap_ACES, with similar range
// Gamma 2.2 correction is baked in, don't use with sRGB conversion!
@export fn tonemapUnreal(color: vec4<f32>) -> vec4<f32> {
  return color / (color + 0.155) * 1.019;
}
