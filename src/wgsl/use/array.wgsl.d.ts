declare module "@use-gpu/wgsl/use/array.wgsl" {
  type ParsedBundle = import('@use-gpu/shader').ParsedBundle;
  const __module: ParsedBundle;
  export const sizeToModulus2: ParsedBundle;
  export const sizeToModulus3: ParsedBundle;
  export const sizeToModulus4: ParsedBundle;
  export const packIndex2: ParsedBundle;
  export const packIndex3: ParsedBundle;
  export const packIndex4: ParsedBundle;
  export const unpackIndex2: ParsedBundle;
  export const unpackIndex3: ParsedBundle;
  export const unpackIndex4: ParsedBundle;
  export const clipIndex2: ParsedBundle;
  export const clipIndex3: ParsedBundle;
  export const clipIndex4: ParsedBundle;
  export const wrapIndex2: ParsedBundle;
  export const wrapIndex3: ParsedBundle;
  export const wrapIndex4: ParsedBundle;
  export const wrapIndex2i: ParsedBundle;
  export const wrapIndex3i: ParsedBundle;
  export const wrapIndex4i: ParsedBundle;
  export const clampIndex2: ParsedBundle;
  export const clampIndex3: ParsedBundle;
  export const clampIndex4: ParsedBundle;
  export default __module;
}
