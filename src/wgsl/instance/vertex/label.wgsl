use '@use-gpu/wgsl/use/types'::{ UIVertex };
use '@use-gpu/wgsl/geometry/quad'::{ getQuadUV };
use '@use-gpu/wgsl/use/view'::{ getViewResolution, worldToClip, getScreenScale, applyZBias };

@optional @link fn getIndex(i: u32) -> u32 { return 0u; };
@optional @link fn getRectangle(i: u32) -> vec4<f32> { return vec4<f32>(-1.0, -1.0, 1.0, 1.0); };
@optional @link fn getUV(i: u32) -> vec4<f32> { return vec4<f32>(0.0, 0.0, 1.0, 1.0); };
@optional @link fn getST(i: u32) -> vec4<f32> { return vec4<f32>(0.0, 0.0, 1.0, 1.0); };
@optional @link fn getShape(i: u32) -> vec2<f32> { return vec2<f32>(0.0, 0.0); };

@optional @link fn getSDFConfig(i: u32) -> vec4<f32> { return vec4<f32>(1.0, 1.0, 16.0, 0.0); };

@optional @link fn getPosition(i: u32) -> vec4<f32> { return vec4<f32>(0.0, 0.0, 0.0, 1.0); };
@optional @link fn getPlacement(i: u32) -> vec2<f32> { return vec2<f32>(0.0, 0.0); };
@optional @link fn getOffset(i: u32) -> vec2<f32> { return vec2<f32>(0.0); };
@optional @link fn getSize(i: u32) -> f32 { return 16.0; };
@optional @link fn getDepth(i: u32) -> f32 { return 0.0; };
@optional @link fn getZBias(i: u32) -> f32 { return 0.0; };
@optional @link fn getColor(i: u32) -> vec4<f32> { return vec4<f32>(0.5, 0.5, 0.5, 1.0); };
@optional @link fn getExpand(i: u32) -> f32 { return 0.0; };
@optional @link fn getFlip(i: u32) -> vec2<f32> { return vec2<f32>(1.0, 1.0); };

@optional @link fn attachLabelTo(
  i: u32,
  shape: vec2<f32>,
  origin: vec2<f32>,
  rectangle: vec4<f32>,
  xy: vec2<f32>,
  depth: f32,
  scale: f32,
  offset: vec2<f32>,
  flip: vec2<f32>,
) -> vec4<f32> { return vec4<f32>(0.0); };

@export fn getLabelVertex(vertexIndex: u32, instanceIndex: u32) -> UIVertex {

  let sdfConfig = getSDFConfig(instanceIndex);
  let fontSize = sdfConfig.z;

  let index = getIndex(instanceIndex);
  let rectangle = getRectangle(instanceIndex);
  let uv4 = getUV(instanceIndex);
  let st4 = getUV(instanceIndex);

  // Clip/view space Y is up in WebGPU, so always flip Y by default.
  let flip = getFlip(index) * vec2<f32>(1, -1);

  let shape = getShape(index);
  let placement = getPlacement(index) * flip;
  let offset = getOffset(index);

  let size = getSize(index);
  let depth = getDepth(index);
  let zBias = getZBias(index);
  let color = getColor(index);
  let expand = getExpand(index);

  // Factor in relative font and atlas scale
  let glyphScale = size / fontSize;

  // Lay out quad
  let uv1 = getQuadUV(vertexIndex);
  let xy1 = uv1 * 2.0 - 1.0;
  let origin = ((placement - 1.0) * 0.5 * shape);

  let xy = mix(rectangle.xy, rectangle.zw, uv1);
  let uv = mix(uv4.xy, uv4.zw, uv1);
  let st = mix(st4.xy, st4.zw, uv1);

  var clipPosition: vec4<f32>;
  if (HAS_ATTACH_LABEL) {
    clipPosition = attachLabelTo(index, shape, origin, rectangle, xy, depth, glyphScale, offset, flip);
  }
  else {
    let position = getPosition(index);
    let center = worldToClip(position);

    // Lerp between fixed size and full perspective.
    let pixelScale = getScreenScale(center.w, depth);
    let finalScale = pixelScale * glyphScale;

    let finalXY = 2.0 * ((xy + origin) * finalScale + offset) * flip;

    // Attach to position
    clipPosition = vec4<f32>(center.xy + finalXY * getViewResolution() * center.w, center.zw);
  }

  if (zBias != 0.0) {
    clipPosition = applyZBias(clipPosition, size * zBias);
  }

  let sdfUV = uv;
  let textureUV = uv;
  let textureST = st;
  let clipUV = vec4<f32>(0.0, 0.0, 1.0, 1.0);

  return UIVertex(
    clipPosition,
    uv1,
    vec4<f32>(sdfConfig.x, sdfConfig.y * glyphScale, 0.0, 0.0),
    sdfUV,
    clipUV,
    textureUV,
    textureST,
    0,
    -1,
    vec4<f32>(shape, 0.0, 0.0),
    vec4<f32>(0.0),
    vec4<f32>(expand, 0.0, 0.0, 0.0),
    vec4<f32>(0.0),
    color,
    instanceIndex,
  );
}
