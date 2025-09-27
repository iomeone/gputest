declare module "@use-gpu/wgsl/material/pbr-default.wgsl" {
  type ParsedBundle = import('../../shader').ParsedBundle;
  const __module: ParsedBundle;
  export const getDefaultPBRMaterial: ParsedBundle;
  export default __module;
}
