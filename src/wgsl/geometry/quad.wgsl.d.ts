declare module "@use-gpu/wgsl/geometry/quad.wgsl" {
  type ParsedBundle = import('../../shader').ParsedBundle;
  const __module: ParsedBundle;
  export const getQuadIndex: ParsedBundle;
  export const getQuadUV: ParsedBundle;
  export default __module;
}
