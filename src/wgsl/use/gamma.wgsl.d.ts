declare module "@use-gpu/wgsl/use/gamma.wgsl" {
  type ParsedBundle = import('@use-gpu/shader').ParsedBundle;
  const __module: ParsedBundle;
  export const toLinear: ParsedBundle;
  export const toLinear2: ParsedBundle;
  export const toLinear3: ParsedBundle;
  export const toLinear4: ParsedBundle;
  export const toGamma: ParsedBundle;
  export const toGamma2: ParsedBundle;
  export const toGamma3: ParsedBundle;
  export const toGamma4: ParsedBundle;
  export default __module;
}
