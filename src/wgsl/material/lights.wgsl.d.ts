declare module "@use-gpu/wgsl/material/lights.wgsl" {
  type ParsedBundle = import('../../shader').ParsedBundle;
  const __module: ParsedBundle;
  export const applyLights: ParsedBundle;
  export default __module;
}
