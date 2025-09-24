declare module "@use-gpu/wgsl/use/types.wgsl" {
  type ParsedBundle = import('../../shader/wgsl/types').ParsedBundle;
  const __module: ParsedBundle;
  export const SolidVertex: ParsedBundle;
  export const MeshVertex: ParsedBundle;
  export default __module;
}
