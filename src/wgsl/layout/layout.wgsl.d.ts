declare module "@use-gpu/wgsl/layout/layout.wgsl" {
  type ParsedBundle = import('../../shader').ParsedBundle;
  const __module: ParsedBundle;
  export const getLayoutPosition: ParsedBundle;
  export default __module;
}
