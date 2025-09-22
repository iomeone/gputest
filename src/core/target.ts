export const makeRenderTexture = (
  device: GPUDevice,
  width: number,
  height: number,
  format: GPUTextureFormat,
  samples: number = 1
): GPUTexture => {
  const renderTexture = device.createTexture({
    // @ts-ignore
    size: { width, height, depthOrArrayLayers: 1 },
    sampleCount: samples,
    format,
    // @ts-ignore
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });

  return renderTexture;
}

export const makeReadbackTexture = (
  device: GPUDevice,
  width: number,
  height: number,
  format: GPUTextureFormat,
  samples: number = 1
): GPUTexture => {
  const renderTexture = device.createTexture({
    // @ts-ignore
    size: { width, height, depthOrArrayLayers: 1 },
    sampleCount: samples,
    format,
    // @ts-ignore
    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
  });

  return renderTexture;
}
