declare module "@use-gpu/wgsl/use/color.wgsl" {
  type ParsedBundle = import('../../shader/wgsl/types').ParsedBundle;
  const __module: ParsedBundle;
  export const toColorSpace: ParsedBundle;
  export default __module;
}
