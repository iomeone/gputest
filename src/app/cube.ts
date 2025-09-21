import { LiveComponent,  useMemo, useOne } from '../live';
import { UniformAttribute } from '../core/types';
import { CameraUniforms } from '../camera/types';


import vertexShader from './glsl/vertex.glsl';
import fragmentShader from './glsl/fragment.glsl';

import { makeCube } from './meshes/cube';
import { makeVertexBuffers, makeUniformBuffer, uploadBuffer } from '../core/buffer';
import { makeUniforms, makeUniformBindings } from '../core/uniform';
import { makeShader, makeShaderStage } from '../core/pipeline';

export type CubeProps = {
  device: GPUDevice,
  colorStates: GPUColorStateDescriptor,
  depthStencilState: GPUDepthStencilStateDescriptor,
  passEncoder: GPURenderPassEncoder,
  defs: UniformAttribute[]
  uniforms: CameraUniforms,
  compileGLSL: (s: string, t: string) => any,
};



export const Cube: LiveComponent<CubeProps> = (context) => (props) => {
  const {device, colorStates, depthStencilState, passEncoder, defs, uniforms, compileGLSL} = props;

  const cube = useOne(context, 0)(makeCube);
  const vertexBuffers = useMemo(context, 1)(() =>
    makeVertexBuffers(device, cube.vertices), [device]);

  const pipeline = useMemo(context, 2)(() => {
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

  const [uniformBuffer, uniformPipe, uniformBindGroup] = useMemo(context, 3)(() => {
    const uniformPipe = makeUniforms(defs);
    const uniformBuffer = makeUniformBuffer(device, uniformPipe.data);
    const entries = makeUniformBindings([{resource: {buffer: uniformBuffer}}]);
    const uniformBindGroup = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries,
    });
    return [uniformBuffer, uniformPipe, uniformBindGroup] as [GPUBuffer, UniformDefinition, GPUBindGroup];
  }, [device, defs, pipeline]);

  uniformPipe.fill(uniforms);
  uploadBuffer(device, uniformBuffer, uniformPipe.data);

  passEncoder.setPipeline(pipeline);
  passEncoder.setBindGroup(0, uniformBindGroup);
  passEncoder.setVertexBuffer(0, vertexBuffers[0]);
  passEncoder.draw(cube.count, 1, 0, 0);
  
  return null;
}
