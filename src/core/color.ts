export const BLEND_NONE = undefined;

export const BLEND_RGBA = {
  color: {
    operation: "add",
    srcFactor: "src-alpha",
    dstFactor: "one-minus-src-alpha",
  },
  alpha: {
    operation: "add",
    srcFactor: "one",
    dstFactor: "one-minus-src-alpha",      
  },
} as any as GPUBlendState;

export const BLEND_PREMULTIPLIED = {
  color: {
    operation: "add",
    srcFactor: "one",
    dstFactor: "one-minus-src-alpha",
  },
  alpha: {
    operation: "add",
    srcFactor: "one",
    dstFactor: "one-minus-src-alpha",      
  },
} as any as GPUBlendState;

export const makeColorState = (format: GPUTextureFormat, blend?: GPUBlendState): GPUColorTargetState => ({
  format,
  blend,
});

export const makeColorAttachment = (
  texture: GPUTexture | null,
  resolve: GPUTexture | null,
  loadValue: GPUColor,
): GPURenderPassColorAttachment => ({
  view: texture ? texture.createView() : null,
  resolveTarget: resolve ? resolve.createView() : undefined,
  loadValue,
} as unknown as GPURenderPassColorAttachment);