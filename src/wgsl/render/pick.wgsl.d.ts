declare module "@use-gpu/wgsl/render/pick.wgsl" {
  type ParsedBundle = import('../../shader').ParsedBundle;
  const __module: ParsedBundle;
  export const getPickingID: ParsedBundle;
  export default __module;
}
