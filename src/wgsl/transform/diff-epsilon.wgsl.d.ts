declare module "@use-gpu/wgsl/transform/diff-epsilon.wgsl" {
  type ParsedBundle = import('@use-gpu/shader').ParsedBundle;
  const __module: ParsedBundle;
  export const getEpsilonDifferential: ParsedBundle;
  export default __module;
}
