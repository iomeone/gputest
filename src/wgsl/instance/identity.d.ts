declare module "@use-gpu/wgsl/instance/identity.wgsl" {
  type ParsedBundle = import('@use-gpu/shader/wgsl/types').ParsedBundle;
  const __module: ParsedBundle;
  export const getIndex: ParsedBundle;
  export default __module;
}
