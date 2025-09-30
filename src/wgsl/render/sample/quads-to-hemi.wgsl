use '../../../wgsl/codec/octahedral'::{ decodeOctahedral, decodeHemiOctahedral, wrapOctahedral };
use '../../../wgsl/codec/cubemap'::{ encodeCubeMap };

@link fn getTexture(uv: vec2<f32>, layer: u32) -> vec4<f32>;

// +Y is the only full face, -Y is unused, others are half and split between top and bottom half
const toLayer: array<u32, 6> = array(1,1,0,3,2,2);

@export fn getQuadsToHemiSample(uv: vec2<f32>) -> vec4<f32> {
  let hemi = uv.xy * 2.0 - 1.0;

  // Remap octohedral Z to cubemap Y
  let uvw = decodeHemiOctahedral(hemi);
  let xyl = encodeCubeMap(uvw.yzx);

  let hl = toLayer[xyl.layer];
  let hs = select((xyl.layer & 1u) + 1u, 0u, xyl.layer == 2u);

  // Map +X/-X and +Z/-Z half-faces
  let cu = xyl.xy.x * .5 + .5;
  let cv = xyl.xy.y * .5 + .5;
  let hv = select(
    cv,
    select(cv, cv + .5, hs > 1u),
    hs > 0u
  );
  let huv = vec2<f32>(cu, hv);

  let sample = getTexture(huv, hl);
  return select(vec4<f32>(1.0), sample, uvw.z >= 0.0);
};
