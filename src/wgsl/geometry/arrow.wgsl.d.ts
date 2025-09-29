declare module "@use-gpu/wgsl/geometry/arrow.wgsl" {
  type ParsedBundle = import('../../shader').ParsedBundle;
  const __module: ParsedBundle;
  export const getArrowSize: ParsedBundle;
  export const getArrowCorrection: ParsedBundle;
  export default __module;
}
