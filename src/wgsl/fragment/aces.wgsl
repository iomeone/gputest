// ACES fit by Stephen Hill (@self_shadow)

// sRGB => XYZ => D65_2_D60 => AP1 => RRT_SAT
const ACES_INPUT = mat3x3(
	0.59719, 0.07600, 0.02840,
	0.35458, 0.90834, 0.13383,
	0.04823, 0.01566, 0.83777
);

// ODT_SAT => XYZ => D60_2_D65 => sRGB
const ACES_OUTPUT = mat3x3(
   1.60475, -0.10208, -0.00327,
  -0.53108,  1.10813, -0.07276,
  -0.07367, -0.00605,  1.07602,
);

fn RRTAndODTFit(v: vec3<f32>) -> vec3<f32> {
  let a = v * (v + 0.0245786) - 0.000090537;
  let b = v * (0.983729 * v + 0.4329510) + 0.238081;
  return a / b;
};

@export fn tonemapACES(color: vec4<f32>) -> vec4<f32> {
  var rgb = color.rgb;
  
  rgb = ACES_INPUT * rgb;
  rgb = RRTAndODTFit(rgb);
  rgb = ACES_OUTPUT * rgb;
  rgb = saturate(rgb);

  return vec4<f32>(rgb, color.a);
};
