import { LiveComponent } from '@use-gpu/live/types';
import { ViewUniforms, UniformPipe, UniformAttribute, UniformType, VertexData, RenderPassMode, DataTexture } from '@use-gpu/core/types';
import { ViewContext, RenderContext, PickingContext, usePickingContext } from '@use-gpu/components';
import { yeet, memo, useContext, useNoContext, useFiber, useMemo, useOne, useState, useResource, tagFunction } from '@use-gpu/live';
import {
  makeVertexBuffers, makeRawSourceTexture, makeMultiUniforms,
  makeRenderPipeline, makeShaderModule, makeSampler, makeTextureBinding,
  uploadBuffer, uploadDataTexture,
} from '@use-gpu/core';
import { linkBundle } from '@use-gpu/shader/wgsl';

import instanceDrawMesh from '@use-gpu/wgsl/instance/draw/mesh.wgsl';
import instanceFragmentMesh from '@use-gpu/wgsl/instance/fragment/mesh.wgsl';

import instanceDrawMeshPick from '@use-gpu/wgsl/instance/draw/mesh-pick.wgsl';
import instanceFragmentMeshPick from '@use-gpu/wgsl/instance/fragment/mesh-pick.wgsl';

export const MESH_UNIFORM_DEFS: UniformAttribute[] = [
  {
    name: 'lightPosition',
    format: UniformType['vec4<f32>'],
  },
  {
    name: 'lightColor',
    format: UniformType['vec4<f32>'],
  },
];

const LIGHT = [-2.5, 3, 2, 1];

export type MeshProps = {
  mesh: VertexData,
  texture: DataTexture,
  mode?: RenderPassMode,
  id?: number,
  blink?: boolean,
};

export const Mesh: LiveComponent<MeshProps> = memo((props: MeshProps) => {
  const {
    mesh,
    texture,
    mode = RenderPassMode.Opaque,
    id = 0,
    blink,
  } = props;

  let blinkState = useOne(() => ({ state: false }));
  useOne(() => {
    if (blink) blinkState.state = !blinkState.state
  }, blink);

  const {viewUniforms, viewDefs} = useContext(ViewContext);
  
  const isDebug = mode === RenderPassMode.Debug;
  const isPicking = mode === RenderPassMode.Picking;
  const {renderContext, pickingUniforms, pickingDefs} = usePickingContext(id, isPicking);
  const {device, colorStates, depthStencilState, samples} = renderContext;

  const vertexBuffers = useMemo(() =>
    makeVertexBuffers(device, mesh.vertices), [device, mesh]);

  const sourceTexture = useMemo(() => {
    const t = makeRawSourceTexture(device, texture);
    uploadDataTexture(device, t, texture);
    return t;
  }, [device, texture]);

  const defines = {
    '@group(VIEW)': '@group(0)',
    '@binding(VIEW)': '@binding(0)',
    '@group(LIGHT)': '@group(0)',
    '@binding(LIGHT)': '@binding(1)',
    '@group(PICKING)': '@group(0)',
    '@binding(PICKING)': '@binding(1)',
  };

  // Render shader
  const vertexShader    = isPicking ? instanceDrawMeshPick     : instanceDrawMesh;
  const fragmentShader = isPicking ? instanceFragmentMeshPick : instanceFragmentMesh;

  const fiber = useFiber();

  // Rendering pipeline
  const pipeline = useMemo(() => {
    const vertexLinked = linkBundle(vertexShader, {}, defines);
    const fragmentLinked = linkBundle(fragmentShader, {}, defines);

    const vertex = makeShaderModule([vertexLinked, 0]);
    const fragment = makeShaderModule([fragmentLinked, 1]);
    
    fiber.__inspect = fiber.__inspect || {};
    fiber.__inspect.vertex = vertexLinked;
    fiber.__inspect.fragment = fragmentLinked;

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
        fragment: {},
      }
    );
  }, [device, colorStates, depthStencilState, samples]);

  // Uniforms
  const [uniform, sampled] = useMemo(() => {
    const meshDefs = MESH_UNIFORM_DEFS;
    const defs = isPicking ? [viewDefs, pickingDefs] : [viewDefs, meshDefs];
    const uniform = makeMultiUniforms(device, pipeline, defs, 0);

    let sampled;
    if (!isPicking) {
      const sampler = makeSampler(device, { });
      sampled = makeTextureBinding(device, pipeline, sampler, sourceTexture, 1);
    }

    return [uniform, sampled];
  }, [device, viewDefs, pickingDefs, isPicking, pipeline]);

  // Return a lambda back to parent(s)
  return yeet({
    [mode]: tagFunction((passEncoder: GPURenderPassEncoder) => {
      const l = blinkState.state ? 1 : 0.5;

      uniform.pipe.fill(viewUniforms);
      uniform.pipe.fill({ lightPosition: LIGHT, lightColor: [l, l, l, 1] });
      if (isPicking) uniform.pipe.fill(pickingUniforms);
      uploadBuffer(device, uniform.buffer, uniform.pipe.data);

      passEncoder.setPipeline(pipeline);
      passEncoder.setBindGroup(0, uniform.bindGroup);
      if (sampled) passEncoder.setBindGroup(1, sampled);
      passEncoder.setVertexBuffer(0, vertexBuffers[0]);
      passEncoder.draw(mesh.count, 1, 0, 0);
    })
  }); 
}, 'Mesh');
