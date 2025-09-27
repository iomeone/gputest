declare module "@use-gpu/wgsl/instance/fragment/shaded.wgsl" {
  type ParsedBundle = import('@use-gpu/shader').ParsedBundle;
  const __module: ParsedBundle;
  export const getShadedFragment: ParsedBundle;
  export default __module;
}
