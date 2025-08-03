import { LiveComponent } from '@use-gpu/live/types';
import { ViewUniforms, UniformPipe, UniformAttribute, UniformType } from '@use-gpu/core/types';

import { ViewContext, RenderContext } from '@use-gpu/components';
import { yeet, memo, useContext, useMemo, useOne, useState, useResource } from '@use-gpu/live';
import {
  makeVertexBuffers, makeUniformBuffer, uploadBuffer,
  makeUniformPipe, makeUniformBindings,
  makeRenderPipeline,
  makeShaderModule, makeShaderStage,
} from '@use-gpu/core';

import vertexShader from './glsl/cube-vertex.glsl';
import fragmentShader from './glsl/cube-fragment.glsl';

export const CUBE_UNIFORM_DEFS: UniformAttribute[] = [
  {
    name: 'blink',
    format: UniformType.float,
  },
];

import { makeCube } from './meshes/cube';

export type CubeProps = {
};

export const Cube: LiveComponent<CubeProps> = memo((fiber) => (props) => {
  const {viewUniforms, viewDefs} = useContext(ViewContext);
  const renderContext = useContext(RenderContext);
  const {device, colorStates, depthStencilState, samples, languages} = renderContext;
  const {glsl: {compile}} = languages;
  console.log("running: cube");
  // Blink state, flips every second
  const [blink, setBlink] = useState(0);
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
        vertex:   {buffers: cube.attributes},
        fragment: {targets: colorStates},
      }
    );
  }, [device, colorStates, depthStencilState, samples, languages]);

  // Uniforms
  const [uniformBuffer, uniformPipe, uniformBindGroup] = useMemo(() => {
    const uniformPipe = makeUniformPipe([...viewDefs, ...CUBE_UNIFORM_DEFS]);
    const uniformBuffer = makeUniformBuffer(device, uniformPipe.data);
    const entries = makeUniformBindings([{resource: {buffer: uniformBuffer}}]);
    const uniformBindGroup = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries,
    });
    return [uniformBuffer, uniformPipe, uniformBindGroup] as [GPUBuffer, UniformPipe, GPUBindGroup];
  }, [device, viewDefs, pipeline]);

  const stateUniforms = {blink};

  // Return a lambda back to parent(s)
  return yeet({ render: (passEncoder: GPURenderPassEncoder) => {
    uniformPipe.fill(viewUniforms);
    uniformPipe.fill(stateUniforms);
    uploadBuffer(device, uniformBuffer, uniformPipe.data);

    passEncoder.setPipeline(pipeline);
    passEncoder.setBindGroup(0, uniformBindGroup);
    passEncoder.setVertexBuffer(0, vertexBuffers[0]);
    passEncoder.draw(cube.count, 1, 0, 0);
  }}); 
}, 'Cube');
