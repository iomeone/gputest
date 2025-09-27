import { UseRenderingContextGPU } from '../core/types';

export type GPUDeviceMount = {
  adapter: GPUAdapter,
  device: GPUDevice,
};

export type CanvasRenderingContextGPU = UseRenderingContextGPU & {
  element: HTMLCanvasElement,
};