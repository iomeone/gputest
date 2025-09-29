declare module "@use-gpu/wgsl/use/light.wgsl" {
  type ParsedBundle = import('@use-gpu/shader').ParsedBundle;
  const __module: ParsedBundle;
  export const getLightCount: ParsedBundle;
  export const getLight: ParsedBundle;
  export default __module;
}
