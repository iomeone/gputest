#ifdef IS_PICKING
#pragma export
layout(set = PICKING_BINDGROUP, binding = PICKING_BINDING) uniform PickingUniforms {
  uint pickingId;
} pickingUniforms;

#pragma export
uvec4 getPickingColor(uint fragIndex) {
  uint r = pickingUniforms.pickingId;
  uint g = fragIndex;
  return uvec4(r, g, 0, 0);
}
#endif
