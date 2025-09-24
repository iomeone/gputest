import { UseRenderingContextGPU } from '@use-gpu/core/types';

export type GPUDeviceMount = {
  adapter: GPUAdapter,
  device: GPUDevice,
};

export type GPUMount = GPUDeviceMount & {
  canvas: HTMLCanvasElement,
};

export type CanvasRenderingContextGPU = UseRenderingContextGPU & {
  element: HTMLCanvasElement,
};