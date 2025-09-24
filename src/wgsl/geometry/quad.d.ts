declare module "@use-gpu/wgsl/geometry/quad.wgsl" {
  type ParsedBundle = import('@use-gpu/shader/wgsl/types').ParsedBundle;
  const __module: ParsedBundle;
  export const getQuadIndex: ParsedBundle;
  export const getQuadUV: ParsedBundle;
  export default __module;
}
