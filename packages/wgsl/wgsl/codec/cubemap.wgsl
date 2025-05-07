struct XYLayer {
  xy: vec2<f32>,
  layer: u32,
};

// Map UVW -> Cube face # + XY
@export fn encodeCubeMap(uvw: vec3<f32>) -> XYLayer {
  let absUVW = abs(uvw);
  let maxAUVW = max(absUVW.x, max(absUVW.y, absUVW.z));

  var face: u32;
  var faceXY: vec2<f32>;
  if (maxAUVW == absUVW.x) {
    face = select(0u, 1u, uvw.x < 0.0);
    faceXY = select(
      vec2<f32>(-uvw.z, -uvw.y),
      vec2<f32>(uvw.z, -uvw.y),
      uvw.x < 0.0
    );
  }
  else if (maxAUVW == absUVW.y) {
    face = select(2u, 3u, uvw.y < 0.0);
    faceXY = select(
      vec2<f32>(uvw.x, uvw.z),
      vec2<f32>(uvw.x, -uvw.z),
      uvw.y < 0.0
    );
  }
  else {
    face = select(4u, 5u, uvw.z < 0.0);
    faceXY = select(
      vec2<f32>(uvw.x, -uvw.y),
      vec2<f32>(-uvw.x, -uvw.y),
      uvw.z < 0.0
    );
  }
  
  return XYLayer(faceXY / maxAUVW, face);
};
