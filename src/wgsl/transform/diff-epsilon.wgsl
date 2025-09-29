use '@use-gpu/wgsl/geometry/normal'::{ getOrthoVector };

@link fn transformPosition(position: vec4<f32>) -> vec4<f32>;
@optional @link fn getEpsilon() -> f32 { return 0.001; };

@export fn getEpsilonDifferential(vector: vec4<f32>, origin: vec4<f32>, contravariant: bool) -> vec4<f32> {
  let e = getEpsilon();

  if (contravariant) {
    let nt = getOrthoVector(vector.xyz);
    let nb = cross(vector.xyz, nt);

    let a = transformPosition(origin).xyz;
    let b = transformPosition(origin + vec4<f32>(nt.xyz * e, 0.0)).xyz;
    let c = transformPosition(origin + vec4<f32>(nb.xyz * e, 0.0)).xyz;

    let n = cross(b - a, c - a);
    return vec4<f32>(normalize(n), vector.w);
  }

  let a = transformPosition(origin).xyz;
  let b = transformPosition(origin + vec4<f32>(vector.xyz * e, 0.0)).xyz;

  return vec4<f32>((b - a) / e, vector.w);
}
