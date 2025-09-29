declare module "@use-gpu/wgsl/shadow/directional.wgsl" {
  type ParsedBundle = import('@use-gpu/shader').ParsedBundle;
  const __module: ParsedBundle;
  export const applyDirectionalShadow: ParsedBundle;
  export default __module;
}
