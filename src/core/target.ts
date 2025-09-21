export const makeRenderTexture = (device: GPUDevice, width: number, height: number, format: GPUTextureFormat): GPUTexture => {
  const renderTexture = device.createTexture({
    // @ts-ignore
    size: { width, height, depthOrArrayLayers: 1 },
    format,
    // @ts-ignore
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });

  return renderTexture;
}
