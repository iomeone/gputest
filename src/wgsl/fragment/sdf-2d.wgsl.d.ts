declare module "@use-gpu/wgsl/fragment/sdf-2d.wgsl" {
  type ParsedBundle = import('@use-gpu/shader').ParsedBundle;
  const __module: ParsedBundle;
  export const SDF: ParsedBundle;
  export const getUVScale: ParsedBundle;
  export const getBoxSDF: ParsedBundle;
  export const getBorderBoxSDF: ParsedBundle;
  export const getRoundedBorderBoxSDF: ParsedBundle;
  export default __module;
}
