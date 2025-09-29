declare module "@use-gpu/wgsl/layout/clip.wgsl" {
  type ParsedBundle = import('../../shader').ParsedBundle;
  const __module: ParsedBundle;
  export const getCombinedClip: ParsedBundle;
  export const getTransformedClip: ParsedBundle;
  export default __module;
}
