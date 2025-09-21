import { Glslang } from '@webgpu/glslang';
import {
  TypedArray, DeepPartial, UseRenderingContextGPU,
  ShaderLanguages, ShaderCompiler, ShaderLanguage,
  ShaderModuleDescriptor, ShaderStageDescriptor,
} from './types';

export const makeLanguages = ({glsl}: {glsl: ShaderCompiler}): ShaderLanguages => ({
  [ShaderLanguage.GLSL]: {
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

export const makeGLSLRenderPipeline = (
  renderContext: UseRenderingContextGPU,
  vertexShader: string,
  fragmentShader: string,
  descriptor: DeepPartial<GPURenderPipelineDescriptor> = {},
) => {
  const {device, colorStates, depthStencilState, samples, languages} = renderContext;
  const {glsl: {compile}} = languages;

  const vertex = makeShaderModule(compile(vertexShader, 'vertex'));
  const fragment = makeShaderModule(compile(fragmentShader, 'fragment'));

  const pipelineDescriptor: GPURenderPipelineDescriptor = {
    depthStencil: depthStencilState,
    ...descriptor,
    multisample: {
      count: samples,
      ...descriptor.multisample,
    },
    vertex: makeShaderStage(device, vertex, {
      ...descriptor.vertex,
    }),
    fragment: makeShaderStage(device, fragment, {
      targets: colorStates,
      ...descriptor.fragment,
    }),
  } as any as GPURenderPipelineDescriptor;

  return device.createRenderPipeline(pipelineDescriptor);
}
