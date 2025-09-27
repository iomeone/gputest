declare module "@use-gpu/wgsl/material/lights-default.wgsl" {
  type ParsedBundle = import('../../shader').ParsedBundle;
  const __module: ParsedBundle;
  export const applyLights: ParsedBundle;
  export default __module;
}
