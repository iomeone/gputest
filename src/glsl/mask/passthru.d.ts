declare module "@use-gpu/glsl/mask/passthru.glsl" {
  type ParsedBundle = import('../../shader/types').ParsedBundle;
  const __module: ParsedBundle;
  export const getPassThruFragment: ParsedBundle;
  export default __module;
}
