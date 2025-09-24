declare module "@use-gpu/wgsl/use/picking.wgsl" {
  type ParsedBundle = import('../../shader/wgsl/types').ParsedBundle;
  const __module: ParsedBundle;
  export const getPickingColor: ParsedBundle;
  export default __module;
}
