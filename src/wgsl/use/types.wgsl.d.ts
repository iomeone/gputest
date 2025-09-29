declare module "@use-gpu/wgsl/use/types.wgsl" {
  type ParsedBundle = import('@use-gpu/shader').ParsedBundle;
  const __module: ParsedBundle;
  export const Light: ParsedBundle;
  export const PickVertex: ParsedBundle;
  export const LightVertex: ParsedBundle;
  export const SolidVertex: ParsedBundle;
  export const ShadedVertex: ParsedBundle;
  export const UIVertex: ParsedBundle;
  export const DepthFragment: ParsedBundle;
  export const SurfaceFragment: ParsedBundle;
  export const MeshVertex: ParsedBundle;
  export default __module;
}
