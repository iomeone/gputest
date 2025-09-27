declare module "@use-gpu/wgsl/layout/clip.wgsl" {
  type ParsedBundle = import('@use-gpu/shader').ParsedBundle;
  const __module: ParsedBundle;
  export const getCombinedClip: ParsedBundle;
  export const getTransformedClip: ParsedBundle;
  export default __module;
}
