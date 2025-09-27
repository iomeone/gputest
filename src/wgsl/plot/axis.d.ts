declare module "@use-gpu/wgsl/plot/axis.wgsl" {
  type ParsedBundle = import('../../shader/wgsl/types').ParsedBundle;
  const __module: ParsedBundle;
  export const getAxisPosition: ParsedBundle;
  export default __module;
}
