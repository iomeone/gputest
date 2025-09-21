export const makeColorState = (format: GPUTextureFormat): GPUColorStateDescriptor => ({
  format,
});

export const makeColorAttachment = (texture: GPUTexture | null, loadValue: GPUColor): GPURenderPassColorAttachmentDescriptor => ({
  view: texture ? texture.createView() : null,
  loadValue,
} as unknown as GPURenderPassColorAttachmentDescriptor);