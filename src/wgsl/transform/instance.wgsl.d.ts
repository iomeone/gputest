declare module "@use-gpu/wgsl/transform/instance.wgsl" {
  type ParsedBundle = import('@use-gpu/shader').ParsedBundle;
  const __module: ParsedBundle;
  export const loadInstance: ParsedBundle;
  export const getTransformMatrix: ParsedBundle;
  export const getNormalMatrix: ParsedBundle;
  export default __module;
}
