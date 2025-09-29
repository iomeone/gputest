import { makeTargetTexture } from './texture';
import { seq } from './tuple';

export const makeDepthTexture = (
  device: GPUDevice,
  width: number,
  height: number,
  format: GPUTextureFormat,
  samples: number = 1,
): GPUTexture =>
  makeTargetTexture(device, width, height, format, samples);

export const makeDepthStencilState = (format: GPUTextureFormat): GPUDepthStencilState => ({
  depthWriteEnabled: true,
  depthCompare: "greater-equal",
  format,
});

export const makeDepthStencilAttachment = (
  depthTexture: GPUTexture,
  depthFormat: GPUTextureFormat,
  depthClearValue: number = 0.0,
  depthLoadOp: GPULoadOp = 'clear',
  depthStoreOp: GPUStoreOp = 'store',
  stencilClearValue: number = 0,
  stencilLoadOp: GPULoadOp = 'clear',
  stencilStoreOp: GPUStoreOp = 'store',
): GPURenderPassDepthStencilAttachment => {
  const hasStencil = depthFormat.match(/stencil/);
  
  if (hasStencil) {
    return {
      view: depthTexture.createView(),
      depthClearValue,
      depthLoadOp,
      depthStoreOp,
      stencilClearValue,
      stencilLoadOp,
      stencilStoreOp,
    };
  }
  else {
    return {
      view: depthTexture.createView(),
      depthClearValue,
      depthLoadOp,
      depthStoreOp,
    };
  }
}

export const makeDepthStencilAttachments = (
  depthTexture: GPUTexture,
  depthFormat: GPUTextureFormat,
  depthLayers: number,
  depthClearValue: number = 0.0,
  depthLoadOp: GPULoadOp = 'clear',
  depthStoreOp: GPUStoreOp = 'store',
  stencilClearValue: number = 0,
  stencilLoadOp: GPULoadOp = 'clear',
  stencilStoreOp: GPUStoreOp = 'store',
): GPURenderPassDepthStencilAttachment[] => {
  const hasStencil = depthFormat.match(/stencil/);
  
  if (hasStencil) {
    return seq(depthLayers).map(i => ({
      view: depthTexture.createView({baseArrayLayer: i, arrayLayerCount: 1}),
      depthClearValue,
      depthLoadOp,
      depthStoreOp,
      stencilClearValue,
      stencilLoadOp,
      stencilStoreOp,
    }));
  }
  else {
    return seq(depthLayers).map(i => ({
      view: depthTexture.createView({baseArrayLayer: i, arrayLayerCount: 1}),
      depthClearValue,
      depthLoadOp,
      depthStoreOp,
    }));
  }
}
