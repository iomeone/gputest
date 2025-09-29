declare module "@use-gpu/wgsl/fragment/aces.wgsl" {
  type ParsedBundle = import('../../shader').ParsedBundle;
  const __module: ParsedBundle;
  export const tonemapACES: ParsedBundle;
  export default __module;
}
