use '@use-gpu/wgsl/use/types'::{ UIVertex };
use '@use-gpu/wgsl/geometry/quad'::{ getQuadUV };
use '@use-gpu/wgsl/use/view'::{ worldToClip, worldToClip3D, to3D, getViewResolution, getViewSize };

@optional @link fn getRectangle(i: u32) -> vec4<f32> { return vec4<f32>(0.0, 0.0, 0.0, 0.0); }
@optional @link fn getRadius(i: u32)    -> vec4<f32> { return vec4<f32>(0.0, 0.0, 0.0, 0.0); }
@optional @link fn getBorder(i: u32)    -> vec4<f32> { return vec4<f32>(0.0, 0.0, 0.0, 0.0); }
@optional @link fn getStroke(i: u32)    -> vec4<f32> { return vec4<f32>(0.5, 0.5, 0.5, 1.0); }
@optional @link fn getFill(i: u32)      -> vec4<f32> { return vec4<f32>(0.5, 0.5, 0.5, 1.0); }
@optional @link fn getUV(i: u32)        -> vec4<f32> { return vec4<f32>(0.0, 0.0, 1.0, 1.0); }
@optional @link fn getST(i: u32)        -> vec4<f32> { return vec4<f32>(0.0, 0.0, 1.0, 1.0); }
@optional @link fn getRepeat(i: u32)    -> i32       { return 0; }

@optional @link fn getSDFConfig(i: u32) -> vec4<f32> { return vec4<f32>(0.0, 0.0, 0.0, 0.0); };
@optional @link fn applyTransform(p: vec4<f32>) -> vec4<f32> { return p; }
@optional @link fn getClip(i: u32) -> vec4<f32> { return vec4<f32>(0.0, 0.0, 0.0, 0.0); }

@export fn getSDFRectangleVertex(vertexIndex: u32, elementIndex: u32) -> UIVertex {
  // Layout clipping for overflow
  var rectangle = getRectangle(elementIndex);
  var clip = getClip(elementIndex);

  var clipUV = vec4<f32>(-1.0, -1.0, 2.0, 2.0);
  if (length(clip) > 0.0) {
    if (
      rectangle.z < clip.x || rectangle.w < clip.y ||
      rectangle.x > clip.z || rectangle.y > clip.w
    ) {
      return UIVertex(
        vec4<f32>(0.0),
        vec2<f32>(0.0),
        vec4<f32>(0.0),
        vec2<f32>(0.0),
        vec4<f32>(0.0),
        vec2<f32>(0.0),
        vec2<f32>(0.0),
        0,
        0,
        vec4<f32>(0.0),
        vec4<f32>(0.0),
        vec4<f32>(0.0),
        vec4<f32>(0.0),
        vec4<f32>(0.0),
        0u,
      );
    }

    if (rectangle.x < clip.x) {
      clipUV.x = (clip.x - rectangle.x) / (rectangle.z - rectangle.x);
    }
    if (rectangle.z > clip.z) {
      clipUV.z = (clip.z - rectangle.x) / (rectangle.z - rectangle.x);
    }
    if (rectangle.y < clip.y) {
      clipUV.y = (clip.y - rectangle.y) / (rectangle.w - rectangle.y);
    }
    if (rectangle.w > clip.w) {
      clipUV.w = (clip.w - rectangle.y) / (rectangle.w - rectangle.y);
    }
  }

  var radius = getRadius(elementIndex);
  var border = getBorder(elementIndex);
  var fill = getFill(elementIndex);
  var stroke = getStroke(elementIndex);
  var uv4 = getUV(elementIndex);
  var st4 = getST(elementIndex);
  var repeat = getRepeat(elementIndex);
  var sdfConfig = getSDFConfig(elementIndex);

  // Fragment shader mode
  var mode: i32;
  if (sdfConfig.x > 0.0) {
    // SDF glyph
    if (uv4.z < 0.0) { mode = -2; }
    else { mode = -1; }
    uv4 = abs(uv4);
  }
  else if (length(radius + border) == 0.0) { mode = 0; } // Rectangle
  else if (length(radius) == 0.0) { mode = 1; } // Rectangle with border
  else { mode = 2; }; // Rounded rectangle with border

  // Prepare quad -> pixel mapping
  var uv1 = getQuadUV(vertexIndex);
  var xy1 = uv1 * 2.0 - 1.0;
  let box = rectangle.zw - rectangle.xy;

  // Get corner
  var position = vec4<f32>(mix(rectangle.xy, rectangle.zw, uv1), 0.0, 1.0);

  var center4  = worldToClip(applyTransform(position));
  var center  = to3D(center4);

  var sdfUV: vec2<f32>;
  var conservative: vec3<f32>;
  // Normal rasterization
  if (mode == -1 || mode == -2) {
    // Rasterize glyphs normally (they are pre-padded)
    conservative = center;
    sdfUV = uv1 * (uv4.zw - uv4.xy);
  }
  // Conservative rasterization
  else {
    // Get two adjacent vertices
    var posFlipX = vec4<f32>(mix(rectangle.xy, rectangle.zw, vec2<f32>(1.0 - uv1.x, uv1.y)), 0.0, 1.0);
    var posFlipY = vec4<f32>(mix(rectangle.xy, rectangle.zw, vec2<f32>(uv1.x, 1.0 - uv1.y)), 0.0, 1.0);

    var flipX = worldToClip3D(applyTransform(posFlipX));
    var flipY = worldToClip3D(applyTransform(posFlipY));

    // Get side length in screen pixels
    var size = getViewSize();

    var dx = (center.xy - flipX.xy) * size;
    var dy = (center.xy - flipY.xy) * size;

    var stepX = normalize(dx);
    var stepY = normalize(dy);

    // Rasterize shapes conservatively
    conservative = vec3<f32>(center.xy + (stepX + stepY) * getViewResolution(), center.z);
    uv1 = uv1 + xy1 / vec2<f32>(length(dx), length(dy));
    sdfUV = uv1 * box;
  }

  let textureUV = mix(uv4.xy, uv4.zw, uv1);
  let textureST = mix(st4.xy, st4.zw, uv1);

  return UIVertex(
    vec4<f32>(conservative, 1.0) * center4.w,
    uv1,
    sdfConfig,
    sdfUV,
    clipUV,
    textureUV,
    textureST,
    repeat,
    mode,
    vec4<f32>(box, 0.0, 0.0),
    radius,
    border,
    stroke,
    fill,
    elementIndex,
  );
}
