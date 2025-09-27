declare module "@use-gpu/wgsl/material/pbr.wgsl" {
  type ParsedBundle = import('../../shader/wgsl/types').ParsedBundle;
  const __module: ParsedBundle;
  export const applyPBRMaterial: ParsedBundle;
  export default __module;
}
