import {
  TypedArray, DeepPartial, UseRenderingContextGPU,
  ShaderModuleDescriptor, ShaderStageDescriptor,
} from './types';

import { patch } from '@use-gpu/state';

export const makeShaderModule = (
  [code, hash]: [TypedArray | string, number | string],
  entryPoint: string = 'main'
): ShaderModuleDescriptor => ({code, hash, entryPoint});

export const makeShaderStage = (device: GPUDevice, descriptor: ShaderModuleDescriptor, extra: any = {}): ShaderStageDescriptor => {
  const {code, entryPoint} = descriptor;

  const gpuDescriptor = {code} as GPUShaderModuleDescriptor;
  const module = device.createShaderModule(gpuDescriptor);

  return {module, entryPoint, ...extra};
}

export const makeRenderPipeline = (
  renderContext: UseRenderingContextGPU,
  vertexShader: ShaderModuleDescriptor,
  fragmentShader: ShaderModuleDescriptor,
  descriptor: DeepPartial<GPURenderPipelineDescriptor> = {},
) => {
  const {device, colorStates, depthStencilState, samples} = renderContext;

  const pipelineDescriptor: GPURenderPipelineDescriptor = patch({
    depthStencil: depthStencilState,
    multisample: { count: samples },
    vertex: makeShaderStage(device, vertexShader),
    fragment: makeShaderStage(device, fragmentShader, {
      targets: colorStates,
    }),
  }, descriptor) as any as GPURenderPipelineDescriptor;

  return device.createRenderPipeline(pipelineDescriptor);
}
