declare module "@use-gpu/wgsl/transform/diff-epsilon.wgsl" {
  type ParsedBundle = import('../../shader').ParsedBundle;
  const __module: ParsedBundle;
  export const getEpsilonDifferential: ParsedBundle;
  export default __module;
}
