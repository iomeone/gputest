import { makeRenderTexture } from './target';

export const makeDepthTexture = (
  device: GPUDevice,
  width: number,
  height: number,
  format: GPUTextureFormat,
  samples: number = 1,
): GPUTexture =>
	makeRenderTexture(device, width, height, format, samples);

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