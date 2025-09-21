export const makeDepthTexture = (device: GPUDevice, width: number, height: number, format: GPUTextureFormat): GPUTexture => {
  const depthTexture = device.createTexture({
    // @ts-ignore
    size: { width, height, depthOrArrayLayers: 1 },
    format,
    // @ts-ignore
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });

  return depthTexture;
}

export const makeDepthStencilState = (format: GPUTextureFormat): GPUDepthStencilStateDescriptor => ({
  depthWriteEnabled: true,
  depthCompare: "less" as GPUCompareFunction,
  format,
});

export const makeDepthStencilAttachment = (depthTexture: GPUTexture): GPURenderPassDepthStencilAttachmentDescriptor => ({
  view: depthTexture.createView(),
  depthLoadValue: 1.0,
  depthStoreOp: "store" as GPUStoreOp,
  stencilLoadValue: 0,
  stencilStoreOp: "store" as GPUStoreOp,
});