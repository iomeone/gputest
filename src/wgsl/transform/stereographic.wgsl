@link fn getTransformMatrix() -> mat4x4<f32>;

@optional @link fn getStereographicBend() -> f32 { return 0.0; };
@optional @link fn getStereographicNormalize() -> f32 { return 1.0; };

@export fn getStereographicPosition(position: vec4<f32>) -> vec4<f32> {
  let stereoBend = getStereographicBend();
  let stereoNormalize = getStereographicNormalize();

  let matrix = getTransformMatrix();

  if (stereoBend > 0.0001) {
    if (position.z == -1.0) {
      return vec4<f32>(0.0);
    }

    let pos = position.xyz;
    let r = mix(1.0, length(pos), stereoNormalize);

    let z = (pos.z + r);
    let iz = 1.0/z;
    let proj = pos.xy * iz;

    var f = stereoBend;
    let mixed = mix(pos.xy, proj, f);
    let out = vec3<f32>(mixed, mix(pos.z, r, f));

    return matrix * vec4<f32>(out, 1.0);
  }
  return matrix * vec4<f32>(position.xyz, 1.0);
}
