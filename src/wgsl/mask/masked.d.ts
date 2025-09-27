declare module "@use-gpu/wgsl/mask/masked.wgsl" {
  type ParsedBundle = import('@use-gpu/shader/wgsl/types').ParsedBundle;
  const __module: ParsedBundle;
  export const getMaskedFragment: ParsedBundle;
  export default __module;
}
