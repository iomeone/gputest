declare module "@use-gpu/wgsl/present/mask.wgsl" {
  type ParsedBundle = import('../../shader').ParsedBundle;
  const __module: ParsedBundle;
  export const getSlideMask: ParsedBundle;
  export default __module;
}
