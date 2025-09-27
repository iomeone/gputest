declare module "@use-gpu/wgsl/use/view.wgsl" {
  type ParsedBundle = import('@use-gpu/shader/wgsl/types').ParsedBundle;
  const __module: ParsedBundle;
  export const viewUniforms: ParsedBundle;
  export const worldToView: ParsedBundle;
  export const viewToClip: ParsedBundle;
  export const worldToClip: ParsedBundle;
  export const clipToScreen3D: ParsedBundle;
  export const screenToClip3D: ParsedBundle;
  export const worldToClip3D: ParsedBundle;
  export const toClip3D: ParsedBundle;
  export const clipLineIntoView: ParsedBundle;
  export const getWorldScale: ParsedBundle;
  export const getPerspectiveScale: ParsedBundle;
  export default __module;
}
