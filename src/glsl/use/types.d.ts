declare module "@use-gpu/glsl/use/types.glsl" {
  type ParsedBundle = import('@use-gpu/shader/types').ParsedBundle;
  const __module: ParsedBundle;
  export const SolidVertex: ParsedBundle;
  export const MeshVertex: ParsedBundle;
  export default __module;
}
