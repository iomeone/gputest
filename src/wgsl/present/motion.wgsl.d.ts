declare module "@use-gpu/wgsl/present/motion.wgsl" {
  type ParsedBundle = import('../../shader').ParsedBundle;
  const __module: ParsedBundle;
  export const getSlideMotion: ParsedBundle;
  export default __module;
}
