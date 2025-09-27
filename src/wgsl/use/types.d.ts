declare module "@use-gpu/wgsl/use/types.wgsl" {
  type ParsedBundle = import('@use-gpu/shader/wgsl/types').ParsedBundle;
  const __module: ParsedBundle;
  export const PickVertex: ParsedBundle;
  export const SolidVertex: ParsedBundle;
  export const UIVertex: ParsedBundle;
  export const MeshVertex: ParsedBundle;
  export default __module;
}
