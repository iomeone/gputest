declare module "@use-gpu/wgsl/instance/fragment/shaded.wgsl" {
  type ParsedBundle = import('../../../shader').ParsedBundle;
  const __module: ParsedBundle;
  export const getShadedFragment: ParsedBundle;
  export default __module;
}
