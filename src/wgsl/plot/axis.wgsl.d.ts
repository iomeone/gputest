declare module "@use-gpu/wgsl/plot/axis.wgsl" {
  type ParsedBundle = import('../../shader').ParsedBundle;
  const __module: ParsedBundle;
  export const getAxisPosition: ParsedBundle;
  export default __module;
}
