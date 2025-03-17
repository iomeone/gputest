import type { Blending } from './types';
import { seq } from './tuple';
import { BLEND_MODES, BLEND_PREMULTIPLY, BLEND_NONE } from './constants';

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

export const makeColorAttachments = (
  texture: GPUTexture | null,
  resolve: GPUTexture | null,
  layers: number,
  clearValue: GPUColor = [0, 0, 0, 0],
  loadOp: GPULoadOp = 'clear',
  storeOp: GPUStoreOp = 'store',
): GPURenderPassColorAttachment[] => seq(layers).map(i => ({
  view: texture ? texture.createView({ baseArrayLayer: resolve ? 0 : i, arrayLayerCount: 1 }) : null,
  resolveTarget: resolve ? resolve.createView({ baseArrayLayer: i, arrayLayerCount: 1 }) : undefined,
  clearValue,
  loadOp,
  storeOp,
} as unknown as GPURenderPassColorAttachment));

export const makeBlendState = (
  blend?: Blending | GPUBlendState | null,
): GPUBlendState | undefined => (
  (blend && (typeof blend === 'object' ? blend : BLEND_MODES[blend])) ?? undefined
);

export const getDefaultBlendMode = (format: string) => format.match(/unorm|float/) ? BLEND_PREMULTIPLY : BLEND_NONE;
