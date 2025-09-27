declare module "@use-gpu/wgsl/plot/volume.wgsl" {
  type ParsedBundle = import('@use-gpu/shader').ParsedBundle;
  const __module: ParsedBundle;
  export const getVolumeGradient: ParsedBundle;
  export default __module;
}
