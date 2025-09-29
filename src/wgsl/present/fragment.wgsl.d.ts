declare module "@use-gpu/wgsl/present/fragment.wgsl" {
  type ParsedBundle = import('@use-gpu/shader').ParsedBundle;
  const __module: ParsedBundle;
  export const getScreenFragment: ParsedBundle;
  export default __module;
}
