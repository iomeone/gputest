declare module "@use-gpu/wgsl/shadow/point.wgsl" {
  type ParsedBundle = import('@use-gpu/shader').ParsedBundle;
  const __module: ParsedBundle;
  export const applyPointShadow: ParsedBundle;
  export default __module;
}
