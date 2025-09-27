declare module "@use-gpu/wgsl/mask/passthru.wgsl" {
  type ParsedBundle = import('../../shader/wgsl/types').ParsedBundle;
  const __module: ParsedBundle;
  export const getPassThruFragment: ParsedBundle;
  export default __module;
}
