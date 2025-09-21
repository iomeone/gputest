import { LiveComponent } from '../live/types';
import { ViewUniforms, UniformDefinition, UniformAttribute, UniformType } from '../core/types';

import { yeet, memoProps, useMemo, useOne, useState, useResource } from '../live';
import {
  makeVertexBuffers, makeUniformBuffer, uploadBuffer,
  makeUniforms, makeUniformBindings,
  makeShader, makeShaderStage,
} from '../core';

import vertexShader from './glsl/vertex.glsl';
import fragmentShader from './glsl/fragment.glsl';

export const CUBE_UNIFORM_DEFS: UniformAttribute[] = [
  {
    name: 'blink',
    format: UniformType.float,
  },
];

import { makeCube } from './meshes/cube';

export type CubeProps = {
  device: GPUDevice,
  colorStates: GPUColorStateDescriptor,
  depthStencilState: GPUDepthStencilStateDescriptor,
  defs: UniformAttribute[]
  uniforms: ViewUniforms,
  compileGLSL: (s: string, t: string) => any,
};

export const Cube: LiveComponent<CubeProps> = memoProps((fiber) => (props) => {
  const {device, colorStates, depthStencilState, defs, uniforms, compileGLSL} = props;

  // Blink state, flips every second
  const [blink, setBlink] = useState(0);
  const blinkUniform = {value: blink};
  useResource((dispose) => {
    const timer = setInterval(() => {
      setBlink(b => 1 - b);
    }, 1000);
    setTimeout(() => clearInterval(timer), 5500);
    dispose(() => clearInterval(timer));
  });

  // Cube vertex data
  const cube = useOne(makeCube);
  const vertexBuffers = useMemo(() =>
    makeVertexBuffers(device, cube.vertices), [device]);

  // Rendering pipeline
  const pipeline = useMemo(() => {
    const pipelineDesc: GPURenderPipelineDescriptor = {
      // @ts-ignore
      primitive: {
        topology: "triangle-list",
        cullMode: "back",
      },
      vertex:   makeShaderStage(device, makeShader(compileGLSL(vertexShader, 'vertex')), {buffers: cube.attributes}),
      // @ts-ignore
      fragment: makeShaderStage(device, makeShader(compileGLSL(fragmentShader, 'fragment')), {targets: colorStates}),
      depthStencil: depthStencilState,
    };
    return device.createRenderPipeline(pipelineDesc);
  }, [device, colorStates, depthStencilState]);

  // Uniforms
  const [uniformBuffer, uniformPipe, uniformBindGroup] = useMemo(() => {
    const uniformPipe = makeUniforms([...defs, ...CUBE_UNIFORM_DEFS]);
    const uniformBuffer = makeUniformBuffer(device, uniformPipe.data);
    const entries = makeUniformBindings([{resource: {buffer: uniformBuffer}}]);
    const uniformBindGroup = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries,
    });
    return [uniformBuffer, uniformPipe, uniformBindGroup] as [GPUBuffer, UniformDefinition, GPUBindGroup];
  }, [device, defs, pipeline]);

  // Return a lambda back to parent(s)
  return yeet((passEncoder: GPURenderPassEncoder) => {
    uniformPipe.fill({...uniforms, blink: blinkUniform});
    uploadBuffer(device, uniformBuffer, uniformPipe.data);

    passEncoder.setPipeline(pipeline);
    passEncoder.setBindGroup(0, uniformBindGroup);
    passEncoder.setVertexBuffer(0, vertexBuffers[0]);
    passEncoder.draw(cube.count, 1, 0, 0);
  }); 
}, 'Cube');
