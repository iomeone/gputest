import { LiveComponent } from '../live/types';
import { ViewUniforms, UniformPipe, UniformAttribute, UniformType, VertexData } from '../core/types';
import { ViewContext, RenderContext } from '../components';
import { yeet, memoProps, useContext, useMemo, useOne, useState, useResource } from '../live';
import {
  makeVertexBuffers, makeUniformBuffer, uploadBuffer,
  makeUniformPipe, makeUniformBindings, 
  makeRenderPipeline, makeShaderModule,
} from '../core';

import vertexShader from './glsl/mesh-vertex.glsl';
import fragmentShader from './glsl/mesh-fragment.glsl';

export const MESH_UNIFORM_DEFS: UniformAttribute[] = [
  {
    name: 'lightPosition',
    format: UniformType.vec4,
  },
];

const LIGHT = [0.5, 3, 2, 1];

export type MeshProps = {
  mesh: VertexData,
};

export const Mesh: LiveComponent<MeshProps> = memoProps((fiber) => (props) => {
  const {mesh} = props;

  const {uniforms, defs} = useContext(ViewContext);
  const renderContext = useContext(RenderContext);
  const {device, colorStates, depthStencilState, samples, languages} = renderContext;
  const {glsl: {compile}} = languages;


  const vertexBuffers = useMemo(() =>
    makeVertexBuffers(device, mesh.vertices), [device, mesh]);

  // Rendering pipeline
  const pipeline = useMemo(() => {
    const vertex = makeShaderModule(compile(vertexShader, 'vertex'));
    const fragment = makeShaderModule(compile(fragmentShader, 'fragment'));
    
    return makeRenderPipeline(
      renderContext,
      vertex,
      fragment,
      {
        primitive: {
          topology: "triangle-list",
          cullMode: "back",
        },
        vertex:   {buffers: mesh.attributes},
        fragment: {targets: colorStates},
      }
    );
  }, [device, colorStates, depthStencilState, samples, languages]);

  // Uniforms
  const [uniformBuffer, uniformPipe, uniformBindGroup] = useMemo(() => {
    const uniformPipe = makeUniformPipe([...defs, ...MESH_UNIFORM_DEFS]);
    const uniformBuffer = makeUniformBuffer(device, uniformPipe.data);
    const entries = makeUniformBindings([{resource: {buffer: uniformBuffer}}]);
    const uniformBindGroup = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries,
    });
    return [uniformBuffer, uniformPipe, uniformBindGroup] as [GPUBuffer, UniformPipe, GPUBindGroup];
  }, [device, defs, pipeline]);

  // Return a lambda back to parent(s)
  return yeet((passEncoder: GPURenderPassEncoder) => {
    const t = +new Date() / 1000;
    const light = [Math.cos(t) * 5, 4, Math.sin(t) * 5, 1];
    uniformPipe.fill({
      ...uniforms,
      lightPosition: { value: light }
    });
    uploadBuffer(device, uniformBuffer, uniformPipe.data);

    passEncoder.setPipeline(pipeline);
    passEncoder.setBindGroup(0, uniformBindGroup);
    passEncoder.setVertexBuffer(0, vertexBuffers[0]);
    passEncoder.draw(mesh.count, 1, 0, 0);
  }); 
}, 'Mesh');
