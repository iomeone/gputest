use '../../wgsl/use/view'::{ clipUVToXY, to3D };

@link fn getDepth(uv: vec2<f32>) -> f32;

@link fn getReprojectionMatrix() -> mat4x4<f32>;

//@link var<storage, read_write> motionDebug: array<atomic<u32>>;

@export fn getMotionSample(uv: vec2<f32>) -> vec4<f32> {
  let clipDepth = getDepth(uv);
  let clipXY = clipUVToXY(uv);
  let clip = vec4<f32>(clipXY, clipDepth, 1.0);

  let reprojected = to3D(getReprojectionMatrix() * clip);

  let delta = clip.xyz - reprojected.xyz;
  let deltaUVZ = vec3<f32>(delta) * vec3<f32>(0.5, -0.5, 1.0);

  /*
  {
    let v = u32(clipDepth * 0xffffffff);
    let d = u32((deltaUVZ.z + .5) * 0xffffffff);

    atomicMin(&motionDebug[0], v);
    atomicMax(&motionDebug[1], v);

    atomicMin(&motionDebug[2], d);
    atomicMax(&motionDebug[3], d);
  }
  */

  return vec4<f32>(deltaUVZ, clipDepth);
};
