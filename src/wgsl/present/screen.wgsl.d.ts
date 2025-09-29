declare module "@use-gpu/wgsl/present/screen.wgsl" {
  type ParsedBundle = import('@use-gpu/shader').ParsedBundle;
  const __module: ParsedBundle;
  export const getScreenVertex: ParsedBundle;
  export default __module;
}
