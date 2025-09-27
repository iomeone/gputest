declare module "@use-gpu/wgsl/use/color.wgsl" {
  type ParsedBundle = import('@use-gpu/shader').ParsedBundle;
  const __module: ParsedBundle;
  export const premultiply: ParsedBundle;
  export default __module;
}
