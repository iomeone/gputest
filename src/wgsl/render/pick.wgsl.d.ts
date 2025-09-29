declare module "@use-gpu/wgsl/render/pick.wgsl" {
  type ParsedBundle = import('@use-gpu/shader').ParsedBundle;
  const __module: ParsedBundle;
  export const getPickingID: ParsedBundle;
  export default __module;
}
