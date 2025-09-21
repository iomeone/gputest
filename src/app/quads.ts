import { LiveComponent } from '../live/types';
import { ViewUniforms, UniformDefinition, UniformAttribute, UniformType, VertexData } from '../core/types';
import { ViewContext, RenderContext } from '../components';
import { yeet, memoProps, useContext, useMemo, useOne, useState, useResource } from '../live';
import {
  makeVertexBuffers, makeUniformBuffer, uploadBuffer,
  makeUniforms, makeUniformBindings,
  
  makeGLSLRenderPipeline,
} from '../core';

import vertexShader from './glsl/quads-vertex.glsl';
import fragmentShader from './glsl/quads-fragment.glsl';

export const MESH_UNIFORM_DEFS: UniformAttribute[] = [
/*
  {
    name: 'lightPosition',
    format: UniformType.vec4,
  },
*/
];

const LIGHT = [0.5, 3, 2, 1];

export type QuadsProps = {
};

export const Quads: LiveComponent<QuadsProps> = memoProps((fiber) => (props) => {

  const {uniforms, defs} = useContext(ViewContext);
  const renderContext = useContext(RenderContext);
  const {device, colorStates, depthStencilState, samples, languages} = renderContext;

  // Rendering pipeline
  const pipeline = useMemo(() =>
    makeGLSLRenderPipeline(
      renderContext,
      vertexShader,
      fragmentShader,
      {
        primitive: {
          topology: "triangle-strip",
          stripIndexFormat: 'uint16',
        },
        vertex:   {},
        fragment: {},
      }
    ),
    [device, colorStates, depthStencilState, samples, languages]
  );

  // Uniforms
  const [uniformBuffer, uniformPipe, uniformBindGroup] = useMemo(() => {
    const uniformPipe = makeUniforms([...defs, ...MESH_UNIFORM_DEFS]);

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
    uniformPipe.fill(uniforms);
    uploadBuffer(device, uniformBuffer, uniformPipe.data);

    passEncoder.setPipeline(pipeline);
    passEncoder.setBindGroup(0, uniformBindGroup);
    passEncoder.draw(4, 4, 0, 0);
  }); 
}, 'Quads');
