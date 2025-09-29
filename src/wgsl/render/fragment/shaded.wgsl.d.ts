declare module "@use-gpu/wgsl/render/fragment/shaded.wgsl" {
  type ParsedBundle = import('../../../shader').ParsedBundle;
  const __module: ParsedBundle;
  export const main: ParsedBundle;
  export const mainWithDepth: ParsedBundle;
  export default __module;
}
