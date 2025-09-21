export const makeColorState = (format: GPUTextureFormat): GPUColorStateDescriptor => ({
  format,
});

export const makeColorAttachment = (loadValue: GPUColor): GPURenderPassColorAttachmentDescriptor => ({
  view: null,
  loadValue
} as unknown as GPURenderPassColorAttachmentDescriptor);