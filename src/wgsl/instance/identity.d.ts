declare module "@use-gpu/wgsl/instance/identity.wgsl" {
  type ParsedBundle = import('../../shader/wgsl/types').ParsedBundle;
  const __module: ParsedBundle;
  export const getIndex: ParsedBundle;
  export default __module;
}
