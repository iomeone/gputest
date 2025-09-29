declare module "@use-gpu/wgsl/app/fragment/mesh.wgsl" {
  type ParsedBundle = import('../../../shader').ParsedBundle;
  const __module: ParsedBundle;
  export const lightUniforms: ParsedBundle;
  export const main: ParsedBundle;
  export default __module;
}
