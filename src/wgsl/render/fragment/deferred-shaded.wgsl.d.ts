declare module "@use-gpu/wgsl/render/fragment/deferred-shaded.wgsl" {
  type ParsedBundle = import('@use-gpu/shader').ParsedBundle;
  const __module: ParsedBundle;
  export const main: ParsedBundle;
  export const mainWithDepth: ParsedBundle;
  export default __module;
}
