import { LiveComponent } from '../live/types';
import { ViewUniforms, UniformDefinition, UniformAttribute, UniformType } from '../core/types';

import { VertexData } from '../core/types';
import { ViewContext, RenderContext, GLSLContext } from '../components';
import { yeet, memoProps, useContext, useMemo, useOne, useState, useResource } from '../live';
import {
  makeVertexBuffers, makeUniformBuffer, uploadBuffer,
  makeUniforms, makeUniformBindings,
  makeShader, makeShaderStage,
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

  const {compileGLSL} = useContext(GLSLContext);
  const {uniforms, defs} = useContext(ViewContext);
  const {device, samples, colorStates, depthStencilState} = useContext(RenderContext);

  const vertexBuffers = useMemo(() =>
    makeVertexBuffers(device, mesh.vertices), [device, mesh]);

  // Rendering pipeline
  const pipeline = useMemo(() => {
    const pipelineDesc: GPURenderPipelineDescriptor = {
      // @ts-ignore
      primitive: {
        topology: "triangle-list",
        cullMode: "back",
      },
      vertex:   makeShaderStage(device, makeShader(compileGLSL(vertexShader, 'vertex')), {buffers: mesh.attributes}),
      // @ts-ignore
      fragment: makeShaderStage(device, makeShader(compileGLSL(fragmentShader, 'fragment')), {targets: colorStates}),
      multisample: {
        count: samples,
        mask: 0xffffffff,
        alphaToCoverageEnabled: false,
      },
      depthStencil: depthStencilState,
    };
    return device.createRenderPipeline(pipelineDesc);
  }, [device, colorStates, depthStencilState]);

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
