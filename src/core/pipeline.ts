import { Glslang } from '@webgpu/glslang';
import {
  TypedArray, DeepPartial, UseRenderingContextGPU,
  ShaderLanguages, ShaderCompiler, ShaderLanguage,
  ShaderModuleDescriptor, ShaderStageDescriptor,
} from './types';

export const makeLanguages = ({glsl}: {glsl: ShaderCompiler}, modules?: Record<string, string>): ShaderLanguages => ({
  [ShaderLanguage.GLSL]: {
    modules: modules ?? {},
    compile: (code: string, stage: any) => glsl(code, stage),
  },
});

export const makeShaderModule = (code: TypedArray | string, entryPoint: string = 'main'): ShaderModuleDescriptor => ({code, entryPoint});

export const makeShaderStage = (device: GPUDevice, descriptor: ShaderModuleDescriptor, extra: any = {}): ShaderStageDescriptor => {
  const {code, entryPoint} = descriptor;

  const gpuDescriptor = {code} as GPUShaderModuleDescriptor;
  const module = device.createShaderModule(gpuDescriptor);

  return {module, entryPoint, ...extra};
}

export const makeRenderPipeline = (
  renderContext: UseRenderingContextGPU,
  vertexShader: string,
  fragmentShader: string,
  descriptor: DeepPartial<GPURenderPipelineDescriptor> = {},
) => {
  const {device, colorStates, depthStencilState, samples, languages} = renderContext;

  const pipelineDescriptor: GPURenderPipelineDescriptor = {
    depthStencil: depthStencilState,
    ...descriptor,
    multisample: {
      count: samples,
      ...descriptor.multisample,
    },
    vertex: makeShaderStage(device, vertexShader, {
      ...descriptor.vertex,
    }),
    fragment: makeShaderStage(device, fragmentShader, {
      targets: colorStates,
      ...descriptor.fragment,
    }),
  } as any as GPURenderPipelineDescriptor;

  return device.createRenderPipeline(pipelineDescriptor);
}
