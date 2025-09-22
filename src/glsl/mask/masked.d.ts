declare module "@use-gpu/glsl/mask/masked.glsl" {
  type ParsedBundle = import('../../shader/types').ParsedBundle;
  const __module: ParsedBundle;
  export const getMaskedFragment: ParsedBundle;
  export default __module;
}
