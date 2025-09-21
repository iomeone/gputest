export const makeColorState = (format: GPUTextureFormat): GPUColorStateDescriptor => ({
  format,
});

export const makeColorAttachment = (
  texture: GPUTexture | null,
  resolve: GPUTexture | null,
  loadValue: GPUColor,
): GPURenderPassColorAttachmentDescriptor => ({
  view: texture ? texture.createView() : null,
  resolveTarget: resolve ? resolve.createView() : undefined,
  loadValue,
} as unknown as GPURenderPassColorAttachmentDescriptor);