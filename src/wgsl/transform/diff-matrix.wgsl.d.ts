declare module "@use-gpu/wgsl/transform/diff-matrix.wgsl" {
  type ParsedBundle = import('../../shader').ParsedBundle;
  const __module: ParsedBundle;
  export const getMatrixDifferential: ParsedBundle;
  export default __module;
}
