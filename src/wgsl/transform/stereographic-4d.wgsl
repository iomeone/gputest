@link fn getTransformMatrix() -> mat4x4<f32>;

@optional @link fn getStereographicBend() -> f32 { return 0.0; };
@optional @link fn getStereographicNormalize() -> f32 { return 1.0; };

@export fn getStereographic4DPosition(position: vec4<f32>) -> vec4<f32> {
  let stereoBend = getStereographicBend();
  let stereoNormalize = getStereographicNormalize();

  let matrix = getTransformMatrix();

  if (stereoBend > 0.0001) {
    if (position.w == -1.0) {
      return vec4<f32>(0.0);
    }

    let pos = position;
    let r = mix(1.0, length(pos), stereoNormalize);

    let w = (pos.w + r);
    let iw = 1.0/w;
    let proj = pos.xyz * iw;

    var f = stereoBend;
    let out = mix(pos.xyz, proj, f);

    return matrix * vec4<f32>(out.xyz, 1.0);
  }

  return matrix * vec4<f32>(position.xyz, 1.0);
}
