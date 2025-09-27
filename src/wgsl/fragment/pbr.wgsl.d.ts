declare module "@use-gpu/wgsl/fragment/pbr.wgsl" {
  type ParsedBundle = import('../../shader').ParsedBundle;
  const __module: ParsedBundle;
  export const PBRParams: ParsedBundle;
  export const PBR: ParsedBundle;
  export default __module;
}
