declare module "@use-gpu/wgsl/mask/masked.wgsl" {
  type ParsedBundle = import('../../shader').ParsedBundle;
  const __module: ParsedBundle;
  export const getMaskedColor: ParsedBundle;
  export default __module;
}
