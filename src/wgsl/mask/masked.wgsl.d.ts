declare module "@use-gpu/wgsl/mask/masked.wgsl" {
  type ParsedBundle = import('@use-gpu/shader').ParsedBundle;
  const __module: ParsedBundle;
  export const getMaskedColor: ParsedBundle;
  export default __module;
}
