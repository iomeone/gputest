declare module "@use-gpu/wgsl/layout/scroll.wgsl" {
  type ParsedBundle = import('../../shader').ParsedBundle;
  const __module: ParsedBundle;
  export const getScrolledPosition: ParsedBundle;
  export default __module;
}
