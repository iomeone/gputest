declare module "@use-gpu/wgsl/instance/fragment/mapped.wgsl" {
  type ParsedBundle = import('@use-gpu/shader').ParsedBundle;
  const __module: ParsedBundle;
  export const getMappedFragment: ParsedBundle;
  export default __module;
}
