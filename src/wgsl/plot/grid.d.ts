declare module "@use-gpu/wgsl/plot/grid.wgsl" {
  type ParsedBundle = import('@use-gpu/shader/wgsl/types').ParsedBundle;
  const __module: ParsedBundle;
  export const getGridPosition: ParsedBundle;
  export default __module;
}
