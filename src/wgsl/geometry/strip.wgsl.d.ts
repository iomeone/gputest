declare module "@use-gpu/wgsl/geometry/strip.wgsl" {
  type ParsedBundle = import('@use-gpu/shader').ParsedBundle;
  const __module: ParsedBundle;
  export const getStripIndex: ParsedBundle;
  export const getStripUV: ParsedBundle;
  export default __module;
}
