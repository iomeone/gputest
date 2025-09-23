declare module "@use-gpu/glsl/geometry/line.glsl" {
  type ParsedBundle = import('@use-gpu/shader/types').ParsedBundle;
  const __module: ParsedBundle;
  export const lineJoinBevel: ParsedBundle;
  export const lineJoinMiter: ParsedBundle;
  export const lineJoinRound: ParsedBundle;
  export const getLineJoin: ParsedBundle;
  export default __module;
}
