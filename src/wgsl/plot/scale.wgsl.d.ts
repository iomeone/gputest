declare module "@use-gpu/wgsl/plot/scale.wgsl" {
  type ParsedBundle = import('../../shader').ParsedBundle;
  const __module: ParsedBundle;
  export const getScalePosition: ParsedBundle;
  export default __module;
}
