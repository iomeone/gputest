import { ColorSpace } from './types';

const COLOR_SPACE = {
  'srgb': 0,
  'linear': 1,
  'p3': 2,
};

const COLOR_CONVERSION = [
  [0, 1, 3],
  [2, 0, 5],
  [4, 6, 7],
];

export const makeColorState = (format: GPUTextureFormat, blend?: GPUBlendState): GPUColorTargetState => ({
  format,
  blend,
});

export const makeColorAttachment = (
  texture: GPUTexture | null,
  resolve: GPUTexture | null,
  clearValue: GPUColor = [0, 0, 0, 0],
  loadOp: GPULoadOp = 'clear',
  storeOp: GPUStoreOp = 'store',
): GPURenderPassColorAttachment => ({
  view: texture ? texture.createView() : null,
  resolveTarget: resolve ? resolve.createView() : undefined,
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

export const getColorSpace = (from: ColorSpace, to: ColorSpace) => {
  const f = COLOR_SPACE[from];
  const t = COLOR_SPACE[to];
  return COLOR_CONVERSION[f][t];
};
