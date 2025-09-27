declare module "@use-gpu/wgsl/plot/grid.wgsl" {
  type ParsedBundle = import('../../shader/wgsl/types').ParsedBundle;
  const __module: ParsedBundle;
  export const getGridPosition: ParsedBundle;
  export default __module;
}
