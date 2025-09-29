declare module "@use-gpu/wgsl/instance/fragment/ui.wgsl" {
  type ParsedBundle = import('../../../shader').ParsedBundle;
  const __module: ParsedBundle;
  export const getUIFragment: ParsedBundle;
  export default __module;
}
