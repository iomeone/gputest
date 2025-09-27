declare module "@use-gpu/wgsl/transform/cartesian.wgsl" {
  type ParsedBundle = import('../../shader/wgsl/types').ParsedBundle;
  const __module: ParsedBundle;
  export const getCartesianPosition: ParsedBundle;
  export default __module;
}
