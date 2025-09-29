declare module "@use-gpu/wgsl/contour/types.wgsl" {
  type ParsedBundle = import('@use-gpu/shader').ParsedBundle;
  const __module: ParsedBundle;
  export const IndirectDrawMetaAtomic: ParsedBundle;
  export const IndirectDrawMeta: ParsedBundle;
  export default __module;
}
