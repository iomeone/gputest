declare module "@use-gpu/wgsl/render/vertex/virtual-shaded.wgsl" {
  type ParsedBundle = import('../../../shader').ParsedBundle;
  const __module: ParsedBundle;
  export const main: ParsedBundle;
  export default __module;
}
