import { GPUMount, GPUDeviceMount } from './types';

export const mountGPUDevice = async (
  requiredFeatures: GPUFeatureName[] = [],
  requiredLimits: Record<string, number> = {},
): Promise<GPUDeviceMount> => {
  if (!navigator.gpu) throw new Error("WebGPU not supported in browser");

  const adapter = await navigator.gpu.requestAdapter({
    powerPreference: "high-performance",
  });
  if (!adapter) throw new Error("Cannot get WebGPU adapter");

  const device = await adapter.requestDevice({
    requiredLimits,
    requiredFeatures,
  });
  if (!device) throw new Error("Cannot get WebGPU device");

  return {adapter, device};
}

export const adoptCanvas = (selector: string): [HTMLCanvasElement, () => void] => {

  const el = document.querySelector(selector);
  if (!el) throw new Error(`Cannot find ${selector} in DOM`);

  const {tagName} = el;
  if (tagName === 'CANVAS') return [el as HTMLCanvasElement, () => {}];

  const canvas = document.createElement('canvas');
  el.appendChild(canvas);

  return [canvas, () => el.removeChild(canvas)];
}

export const makePresentationContext = (
  device: GPUDevice,
  canvas: HTMLCanvasElement,
  format: GPUTextureFormat,
): GPUCanvasContext => {
  const gpuContext = canvas.getContext("webgpu") as unknown as GPUCanvasContext | null;
  if (!gpuContext) throw new Error("Cannot get WebGPU Canvas context");

  const descriptor = {
    device,
    format,
    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_DST,
    compositingAlphaMode: "opaque",
    viewFormats: [format, format + '-srgb'],
  };

  // @ts-ignore
  gpuContext.configure(descriptor);

  // @ts-ignore
  return gpuContext;
}
