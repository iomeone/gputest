@infer type T;

@link fn getSurface(
  uv: vec4<f32>,
  coord: vec4<f32>,
) -> @infer(T) T {};

@link fn sampleSSAO(xy: vec2<u32>) -> vec4<f32>;

@link fn getOpacity() -> f32;
@link fn getIndirect() -> f32;

@export fn getGBufferSSAOSurface(
  uv: vec2<f32>,
  coord: vec4<f32>,
) -> T {
  var surface = getSurface(uv, coord);
  let ssao = sampleSSAO(vec2<u32>(coord.xy));

  // Albedo-based indirect bounce approximation
  let directAO = ssao.w;
  let albedo = length(surface.albedo) / 1.73;
  let abc = vec3<f32>(2.0404, 4.7951, 2.7552) * albedo + vec3<f32>(-0.3324, -0.6417, 0.6903);  
  let indirectAO = ((abc.x * directAO - abc.y) * directAO + abc.z) * directAO;

  // Control effect with visual blend
  let totalAO = mix(directAO, indirectAO, getIndirect());
  let ao = mix(1.0, totalAO, getOpacity());

  surface.occlusion = vec4<f32>(ssao.xyz * 2.0 - 1.0, surface.occlusion.w * ao);

  return surface;
}
