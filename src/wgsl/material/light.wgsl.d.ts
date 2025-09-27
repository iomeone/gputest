declare module "@use-gpu/wgsl/material/light.wgsl" {
  type ParsedBundle = import('../../shader').ParsedBundle;
  const __module: ParsedBundle;
  export const applyLight: ParsedBundle;
  export default __module;
}
