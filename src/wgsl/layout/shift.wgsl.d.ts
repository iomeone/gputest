declare module "@use-gpu/wgsl/layout/shift.wgsl" {
  type ParsedBundle = import('../../shader').ParsedBundle;
  const __module: ParsedBundle;
  export const getShiftedRectangle: ParsedBundle;
  export default __module;
}
