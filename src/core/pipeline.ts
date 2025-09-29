import type {
  TypedArray, UseGPURenderContext,
  ShaderModuleDescriptor, ShaderStageDescriptor,
} from './types';
import type { Update } from '@use-gpu/state';

import { patch, $delete } from '@use-gpu/state';

export const makeShaderModuleDescriptor = (
  code: TypedArray | string,
  hash: string | number,
  entryPoint: string = 'main'
): ShaderModuleDescriptor => ({code, hash, entryPoint});

export const makeShaderStage = (device: GPUDevice, descriptor: ShaderModuleDescriptor, extra: any = {}): ShaderStageDescriptor => {
  const {code, entryPoint} = descriptor;

  const gpuDescriptor = {code} as GPUShaderModuleDescriptor;
  const module = device.createShaderModule(gpuDescriptor);

  return {module, entryPoint, ...extra};
}

export const makeRenderPipeline = (
  device: GPUDevice,
  vertexShader: ShaderModuleDescriptor,
  fragmentShader: ShaderModuleDescriptor | null,
  colorStates: GPUColorTargetState[],
  depthStencilState: GPUDepthStencilState | undefined,
  samples: number,
  descriptor: Update<GPURenderPipelineDescriptor> = {},
  layout?: GPUPipelineLayout,
) => {
  const pipelineDescriptor: GPURenderPipelineDescriptor = patch({
    layout: layout ?? 'auto',
    depthStencil: depthStencilState,
    multisample: { count: samples },
    vertex: makeShaderStage(device, vertexShader),
    fragment: fragmentShader ? makeShaderStage(device, fragmentShader, {
      targets: colorStates,
    }) : undefined,
  } as any, descriptor) as any as GPURenderPipelineDescriptor;

  if (!depthStencilState) delete pipelineDescriptor.depthStencil;

  return device.createRenderPipeline(pipelineDescriptor);
}

export const makeRenderPipelineAsync = (
  device: GPUDevice,
  vertexShader: ShaderModuleDescriptor,
  fragmentShader: ShaderModuleDescriptor | null,
  colorStates: GPUColorTargetState[],
  depthStencilState: GPUDepthStencilState | undefined,
  samples: number,
  descriptor: Update<GPURenderPipelineDescriptor> = {},
  layout?: GPUPipelineLayout,
) => {
  const pipelineDescriptor: GPURenderPipelineDescriptor = patch({
    layout: layout ?? 'auto',
    depthStencil: depthStencilState,
    multisample: { count: samples },
    vertex: makeShaderStage(device, vertexShader),
    fragment: fragmentShader ? makeShaderStage(device, fragmentShader, {
      targets: colorStates,
    }) : undefined,
  } as any, descriptor) as any as GPURenderPipelineDescriptor;

  if (!depthStencilState) delete pipelineDescriptor.depthStencil;
  return device.createRenderPipelineAsync(pipelineDescriptor);
}

export const makeComputePipeline = (
  device: GPUDevice,
  shader: ShaderModuleDescriptor,
  layout?: GPUPipelineLayout,
) => {
  const pipelineDescriptor: GPUComputePipelineDescriptor = {
    layout: layout ?? 'auto',
    compute: makeShaderStage(device, shader),
  };
  return device.createComputePipeline(pipelineDescriptor);
}

export const makeComputePipelineAsync = (
  device: GPUDevice,
  shader: ShaderModuleDescriptor,
  layout?: GPUPipelineLayout,
) => {
  const pipelineDescriptor: GPUComputePipelineDescriptor = {
    layout: layout ?? 'auto',
    compute: makeShaderStage(device, shader),
  };
  return device.createComputePipelineAsync(pipelineDescriptor);
}

export const makePipelineLayout = (
  device: GPUDevice,
  bindGroupLayouts: GPUBindGroupLayout[],
) => {
  return device.createPipelineLayout({
    bindGroupLayouts,
  });
}

