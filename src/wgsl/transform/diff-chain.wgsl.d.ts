declare module "@use-gpu/wgsl/transform/diff-chain.wgsl" {
  type ParsedBundle = import('@use-gpu/shader').ParsedBundle;
  const __module: ParsedBundle;
  export const getChainDifferential: ParsedBundle;
  export default __module;
}
