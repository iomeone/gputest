use '@use-gpu/wgsl/use/types'::{ SolidVertex };
use '@use-gpu/wgsl/geometry/quad'::{ getQuadUV };
use '@use-gpu/wgsl/use/view'::{ worldToClip, worldToClip3D, to3D, getViewResolution, getViewSize };

@optional @link fn getRectangle(i: u32) -> vec4<f32> { return vec4<f32>(0.0, 0.0, 0.0, 0.0); }
@optional @link fn getFill(i: u32)      -> vec4<f32> { return vec4<f32>(0.5, 0.5, 0.5, 1.0); }

@optional @link fn applyMotion(p: vec4<f32>) -> vec4<f32> { return p; }
@optional @link fn applyTransform(p: vec4<f32>) -> vec4<f32> { return p; }

@export fn getScreenVertex(vertexIndex: u32, instanceIndex: u32) -> SolidVertex {

  var rectangle = getRectangle(instanceIndex);
  var fill = getFill(instanceIndex);

  // Prepare quad -> pixel mapping
  var uv1 = getQuadUV(vertexIndex);
  var xy1 = uv1 * 2.0 - 1.0;
  let box = rectangle.zw - rectangle.xy;

  // Get corner without motion
  var unmoved = vec4<f32>(mix(rectangle.xy, rectangle.zw, uv1), 0.0, 1.0);
  var corner4 = worldToClip(applyTransform(unmoved));
  var corner = to3D(corner4);

  // Get two adjacent vertices
  var posFlipX = vec4<f32>(mix(rectangle.xy, rectangle.zw, vec2<f32>(1.0 - uv1.x, uv1.y)), 0.0, 1.0);
  var posFlipY = vec4<f32>(mix(rectangle.xy, rectangle.zw, vec2<f32>(uv1.x, 1.0 - uv1.y)), 0.0, 1.0);

  var flipX = worldToClip3D(applyTransform(posFlipX));
  var flipY = worldToClip3D(applyTransform(posFlipY));

  // Get side length in screen pixels
  var size = getViewSize();

  var dx = (corner.xy - flipX.xy) * size;
  var dy = (corner.xy - flipY.xy) * size;

  var stepX = normalize(dx);
  var stepY = normalize(dy);

  // Rasterize shapes conservatively
  let expand = (stepX + stepY) * getViewResolution();
  let conservative = vec3<f32>(corner.xy + expand, corner.z);
  uv1 = uv1 + xy1 / vec2<f32>(length(dx), length(dy));

  let uv4 = vec4<f32>((conservative.xy * vec2<f32>(1.0, -1.0)) * .5 + .5, 0.0, 0.0);

  // Get corner with motion
  var moved = vec4<f32>(mix(rectangle.xy, rectangle.zw, uv1), 0.0, 1.0);
  var position4 = worldToClip(applyTransform(applyMotion(moved)));

  return SolidVertex(
    position4,
    fill,
    uv4,
    uv4,
    vec4<f32>(1.0),
    0
  );
}
