declare module "@use-gpu/wgsl/codec/octahedral.wgsl" {
  type ParsedBundle = import('../../shader').ParsedBundle;
  const __module: ParsedBundle;
  export const encodeOctahedral: ParsedBundle;
  export const decodeOctahedral: ParsedBundle;
  export const wrapOctahedral: ParsedBundle;
  export default __module;
}
