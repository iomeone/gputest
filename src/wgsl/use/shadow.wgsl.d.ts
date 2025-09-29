declare module "@use-gpu/wgsl/use/shadow.wgsl" {
  type ParsedBundle = import('../../shader').ParsedBundle;
  const __module: ParsedBundle;
  export const sampleShadow: ParsedBundle;
  export default __module;
}
