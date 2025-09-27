import { makeRenderTexture } from './texture';

export const makeDepthTexture = (
  device: GPUDevice,
  width: number,
  height: number,
  format: GPUTextureFormat,
  samples: number = 1,
): GPUTexture =>
  makeRenderTexture(device, width, height, format, samples);

export const makeDepthStencilState = (format: GPUTextureFormat): GPUDepthStencilState => ({
  depthWriteEnabled: true,
  depthCompare: "less-equal" as GPUCompareFunction,
  format,
});

export const makeDepthStencilAttachment = (
  depthTexture: GPUTexture,
  depthClearValue: number = 1.0,
  depthLoadOp: GPULoadOp = 'clear',
  depthStoreOp: GPUStoreOp = 'store',
  stencilClearValue: number = 0,
  stencilLoadOp: GPULoadOp = 'clear',
  stencilStoreOp: GPUStoreOp = 'store',
): GPURenderPassDepthStencilAttachment => ({
  view: depthTexture.createView(),
  depthClearValue,
  depthLoadOp,
  depthStoreOp,
  stencilClearValue,
  stencilLoadOp,
  stencilStoreOp,
});