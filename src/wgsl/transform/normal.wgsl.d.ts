declare module "@use-gpu/wgsl/transform/normal.wgsl" {
  type ParsedBundle = import('@use-gpu/shader').ParsedBundle;
  const __module: ParsedBundle;
  export const getTransformedNormal: ParsedBundle;
  export default __module;
}
