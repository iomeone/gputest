declare module "@use-gpu/wgsl/transform/scissor.wgsl" {
  type ParsedBundle = import('../../shader').ParsedBundle;
  const __module: ParsedBundle;
  export const getScissorLevel: ParsedBundle;
  export default __module;
}
