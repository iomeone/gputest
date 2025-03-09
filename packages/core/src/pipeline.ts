import type {
  TypedArray, ShaderModuleDescriptor, ShaderStageDescriptor,
} from './types';
import type { Update } from '@use-gpu/state';

import { patch } from '@use-gpu/state';
import { LOGGING } from './debug';

export const makeShaderModuleDescriptor = (
  code: TypedArray | string,
  hash: string | number,
  entryPoint: string = 'main',
  label?: string,
): ShaderModuleDescriptor => ({code, hash, entryPoint, label});

export const makeShaderStage = (device: GPUDevice, descriptor: ShaderModuleDescriptor, extra: any = {}): ShaderStageDescriptor => {
  const {code, entryPoint, label} = descriptor;

  const gpuDescriptor = {code, label} as GPUShaderModuleDescriptor;
  const module = device.createShaderModule(gpuDescriptor);
  if (label) module.label = label;

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
  label?: string,
) => {
  const pipelineDescriptor: GPURenderPipelineDescriptor = patch({
    label: [label, vertexShader.entryPoint, fragmentShader?.entryPoint].filter(s => s != null).join('/'),
    layout: layout ?? 'auto',
    depthStencil: depthStencilState,
    multisample: { count: samples },
    vertex: makeShaderStage(device, vertexShader),
    fragment: fragmentShader ? makeShaderStage(device, fragmentShader, {
      targets: colorStates,
    }) : undefined,
  } as any, descriptor) as any as GPURenderPipelineDescriptor;

  if (!depthStencilState) delete pipelineDescriptor.depthStencil;

  LOGGING.pipeline && console.warn('Created render pipeline', pipelineDescriptor);
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
  label?: string,
) => {
  const pipelineDescriptor: GPURenderPipelineDescriptor = patch({
    label: [label, vertexShader.entryPoint, fragmentShader?.entryPoint].filter(s => s != null).join('/'),
    layout: layout ?? 'auto',
    depthStencil: depthStencilState,
    multisample: { count: samples },
    vertex: makeShaderStage(device, vertexShader),
    fragment: fragmentShader ? makeShaderStage(device, fragmentShader, {
      targets: colorStates,
    }) : undefined,
  } as any, descriptor) as any as GPURenderPipelineDescriptor;

  if (!depthStencilState) delete pipelineDescriptor.depthStencil;

  LOGGING.pipeline && console.warn('Created render pipeline async', pipelineDescriptor);
  return device.createRenderPipelineAsync(pipelineDescriptor);
}

export const makeComputePipeline = (
  device: GPUDevice,
  shader: ShaderModuleDescriptor,
  layout?: GPUPipelineLayout,
  label?: string,
) => {
  const pipelineDescriptor: GPUComputePipelineDescriptor = {
    label: [label, shader.entryPoint].filter(s => s != null).join('/'),
    layout: layout ?? 'auto',
    compute: makeShaderStage(device, shader),
  };
  LOGGING.pipeline && console.warn('Created compute pipeline', pipelineDescriptor);
  return device.createComputePipeline(pipelineDescriptor);
}

export const makeComputePipelineAsync = (
  device: GPUDevice,
  shader: ShaderModuleDescriptor,
  layout?: GPUPipelineLayout,
  label?: string,
) => {
  const pipelineDescriptor: GPUComputePipelineDescriptor = {
    label: [label, shader.entryPoint].filter(s => s != null).join('/'),
    layout: layout ?? 'auto',
    compute: makeShaderStage(device, shader),
  };
  LOGGING.pipeline && console.warn('Created compute pipeline async', pipelineDescriptor);
  return device.createComputePipelineAsync(pipelineDescriptor);
}

export const makePipelineLayout = (
  device: GPUDevice,
  bindGroupLayouts: GPUBindGroupLayout[],
  label?: string,
) => {
  return device.createPipelineLayout({
    bindGroupLayouts,
    label,
  });
}

