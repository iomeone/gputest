@link fn getSize() -> vec2<u32> {};
@link fn getSeed(i: u32) -> f32 {};

@link var velocityTexture: texture_storage_2d<rgba32float, write>;

@compute @workgroup_size(8, 8)
fn main(
  @builtin(global_invocation_id) globalId: vec3<u32>,
) {
  let size = getSize();

  if (any(globalId.xy >= size)) { return; }
  let center = vec2<i32>(globalId.xy);

  let uv = (vec2<f32>(center) + 0.5) / vec2<f32>(size);

  // Random shapes for initial density
  let uvRepeat = fract(uv) - .5;
  var xy1 = uvRepeat - vec2<f32>(0, .5);
  var xy2 = uvRepeat - vec2<f32>(0, .3);
  var xy3 = uvRepeat - vec2<f32>(.33, -.4);
  var xy4 = uvRepeat - vec2<f32>(.33, .4);

  let sd = getSeed(0u);
  let dx = sin(uvRepeat.y * 6.28*6.0 + sd * 3.0);
  let dy = cos(uvRepeat.x * 6.28*6.0 - sd*sd * 2.0) + .3;
  xy1 += vec2<f32>(dx, dy)*.1;
  xy2 += vec2<f32>(dx, dy)*.1;

  let r1 = dot(xy1, xy1);
  let r2 = dot(xy2, xy2);
  let r3 = dot(xy3, xy3);

  let c1 = f32(r1 < .3);
  let c2 = f32(r2 < .2);
  let c3 = f32(r3 < .001);
  let c4 = f32(abs(xy4.x) < .1 && abs(xy4.y) < .01);

  let c = (1.0 - c1) * c2 + c3 + c4;

  // Random swirl for initial velocity
  let edge = min(uv, 1.0 - uv);
  let velocity = vec2<f32>(-uvRepeat.y, uvRepeat.x) / (1.0 + dot(uv, uv)) * edge.x * edge.y * 30.0 + vec2<f32>(dx + .1, dy) * .35;

  textureStore(velocityTexture, center, vec4<f32>(velocity, c, 0.0));
}

