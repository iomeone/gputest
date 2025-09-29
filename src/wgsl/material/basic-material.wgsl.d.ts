declare module "@use-gpu/wgsl/material/basic-material.wgsl" {
  type ParsedBundle = import('@use-gpu/shader').ParsedBundle;
  const __module: ParsedBundle;
  export const getBasicMaterial: ParsedBundle;
  export default __module;
}
