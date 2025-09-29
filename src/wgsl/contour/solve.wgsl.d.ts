declare module "@use-gpu/wgsl/contour/solve.wgsl" {
  type ParsedBundle = import('../../shader').ParsedBundle;
  const __module: ParsedBundle;
  export const approx3x3: ParsedBundle;
  export default __module;
}
