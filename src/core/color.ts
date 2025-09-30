export const makeColorState = (format: GPUTextureFormat, blend?: GPUBlendState): GPUColorTargetState => ({
  format,
  blend,
});

export const makeColorAttachment = (
  texture: GPUTexture | GPUTextureView | null,
  resolve: GPUTexture | GPUTextureView | null,
  clearValue: GPUColor = [0, 0, 0, 0],
  loadOp: GPULoadOp = 'clear',
  storeOp: GPUStoreOp = 'store',
): GPURenderPassColorAttachment => ({
  view: texture ? (texture instanceof GPUTextureView ? texture : texture.createView()) : null,
  resolveTarget: resolve ? (resolve instanceof GPUTextureView ? resolve : resolve.createView()) : undefined,
  clearValue,
  loadOp,
  storeOp,
} as unknown as GPURenderPassColorAttachment);

export const makeColorAttachmentWithFormat = (
  texture: GPUTexture | null,
  resolve: GPUTexture | null,
  format: GPUTextureFormat,
  clearValue: GPUColor = [0, 0, 0, 0],
  loadOp: GPULoadOp = 'clear',
  storeOp: GPUStoreOp = 'store',
): GPURenderPassColorAttachment => ({
  view: texture ? texture.createView({ format }) : null,
  resolveTarget: resolve ? resolve.createView() : undefined,
  clearValue,
  loadOp,
  storeOp,
} as unknown as GPURenderPassColorAttachment);
