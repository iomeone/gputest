use '@use-gpu/wgsl/fragment/pbr'::{ PBR };
use '@use-gpu/wgsl/use/view'::{ viewUniforms };
use '@use-gpu/wgsl/use/light'::{ lightUniforms };

@group(1) @binding(0) var s: sampler;
@group(1) @binding(1) var t: texture_2d<f32>;

struct FragmentOutput {
  @location(0) outColor: vec4<f32>;
};

@stage(fragment)
fn main(
  @location(0) fragColor: vec4<f32>,
  @location(1) fragUV: vec2<f32>,
  @location(2) fragNormal: vec3<f32>,
  @location(3) fragPosition: vec3<f32>,
) -> FragmentOutput {
  var fragLight: vec3<f32> = lightUniforms.lightPosition.xyz - fragPosition;
  var fragView: vec3<f32> = viewUniforms.viewPosition.xyz - fragPosition;

  var N: vec3<f32> = normalize(fragNormal);
  var L: vec3<f32> = normalize(fragLight);
  var V: vec3<f32> = normalize(fragView);

  var texColor: vec4<f32> = textureSample(t, s, fragUV);
  var inColor: vec4<f32> = fragColor * texColor;
  if (inColor.a <= 0.0) { discard; }

  var albedo: vec3<f32> = inColor.rgb;
  var metalness: f32 = 0.2;
  var roughness: f32 = 0.8;

  var color: vec3<f32> = PBR(N, L, V, albedo, metalness, roughness) * lightUniforms.lightColor.xyz;
  var outColor: vec4<f32> = vec4<f32>(color, inColor.a);

  return FragmentOutput(outColor);
}
