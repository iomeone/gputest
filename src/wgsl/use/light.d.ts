declare module "@use-gpu/wgsl/use/light.wgsl" {
  type ParsedBundle = import('@use-gpu/shader/wgsl/types').ParsedBundle;
  const __module: ParsedBundle;
  export const lightUniforms: ParsedBundle;
  export default __module;
}
