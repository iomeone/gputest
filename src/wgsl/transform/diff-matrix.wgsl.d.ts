declare module "@use-gpu/wgsl/transform/diff-matrix.wgsl" {
  type ParsedBundle = import('@use-gpu/shader').ParsedBundle;
  const __module: ParsedBundle;
  export const getMatrixDifferential: ParsedBundle;
  export default __module;
}
