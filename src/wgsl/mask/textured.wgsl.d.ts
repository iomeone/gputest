declare module "@use-gpu/wgsl/mask/textured.wgsl" {
  type ParsedBundle = import('../../shader').ParsedBundle;
  const __module: ParsedBundle;
  export const getTextureFragment: ParsedBundle;
  export default __module;
}
