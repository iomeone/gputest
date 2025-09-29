declare module "@use-gpu/wgsl/material/pbr-material.wgsl" {
  type ParsedBundle = import('../../shader').ParsedBundle;
  const __module: ParsedBundle;
  export const getPBRMaterial: ParsedBundle;
  export default __module;
}
