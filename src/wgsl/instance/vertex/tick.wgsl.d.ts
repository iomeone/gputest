declare module "@use-gpu/wgsl/instance/vertex/tick.wgsl" {
  type ParsedBundle = import('../../../shader').ParsedBundle;
  const __module: ParsedBundle;
  export const getTickPosition: ParsedBundle;
  export default __module;
}
