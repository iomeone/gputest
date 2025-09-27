declare module "@use-gpu/wgsl/geometry/line.wgsl" {
  type ParsedBundle = import('@use-gpu/shader').ParsedBundle;
  const __module: ParsedBundle;
  export const lineJoinBevel: ParsedBundle;
  export const lineJoinMiter: ParsedBundle;
  export const lineJoinRound: ParsedBundle;
  export const getLineJoin: ParsedBundle;
  export default __module;
}
