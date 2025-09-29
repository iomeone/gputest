declare module "@use-gpu/wgsl/mask/scissor.wgsl" {
  type ParsedBundle = import('@use-gpu/shader').ParsedBundle;
  const __module: ParsedBundle;
  export const getScissorColor: ParsedBundle;
  export const isScissored: ParsedBundle;
  export default __module;
}
