import type { LiveComponent } from '@use-gpu/live';
import type { UniformAttribute, VertexData, RenderPassMode, DataTexture } from '@use-gpu/core';

import { useViewContext, useDeviceContext, useRenderContext, usePickingContext } from '@use-gpu/workbench';
import { yeet, memo, useMemo } from '@use-gpu/live';
import {
  makeVertexBuffers, makeRawTexture, makeMultiUniforms,
  makeRenderPipeline, makeShaderModuleDescriptor, makeSampler, makeTextureBinding,
  uploadBuffer, uploadDataTexture,
} from '@use-gpu/core';
import { linkBundle, getBundleLabel } from '@use-gpu/shader/wgsl';
import { useInspectable, useNativeColor, PassReconciler } from '@use-gpu/workbench';

import instanceDrawMesh from './vertex/mesh.wgsl';
import instanceDrawMeshPick from './vertex/mesh-pick.wgsl';

import instanceFragmentMesh from './fragment/mesh.wgsl';
import instanceFragmentPickGeometry from '@use-gpu/wgsl/render/fragment/pick.wgsl';

const {quote} = PassReconciler;

//
// This component shows how to do "raw" rendering with Use.GPU,
// without using any of the built-in components or binding gen,
// but while still fully supporting GPU mouse picking and color spaces.
//
// It is mainly intended as an anti-example.
//
// This demonstrates:
// - How much boilerplate raw WebGPU requires, even with the @use-gpu/core helpers.
// - The No-API nature of Use.GPU. There is no magic sauce locked away inside the standard components.
// - How to use vertex buffers, if you wanted them.
// - How even the bind-group assignments are customizable, if you need to.
//

export const MESH_UNIFORM_DEFS: UniformAttribute[] = [
  {
    name: 'lightPosition',
    format: 'vec4<f32>',
  },
  {
    name: 'lightColor',
    format: 'vec4<f32>',
  },
];

const LIGHT = [-2.5, 3, 2, 1];

export type RawMeshProps = {
  mesh: VertexData,
  texture: DataTexture,
  mode?: RenderPassMode,
  id?: number,
  blink?: number,
};

export const RawMesh: LiveComponent<RawMeshProps> = memo((props: RawMeshProps) => {
  const {
    mesh,
    texture,
    mode = 'opaque',
    id = 0,
    blink,
  } = props;

  const blinkState = !!((blink || 0) % 2);

  const device = useDeviceContext();
  const {bind: unbind, uniforms: viewUniforms, defs: viewDefs} = useViewContext();

  // Picking mode
  const isPicking = mode === 'picking';

  const renderContext = useRenderContext();
  const {renderContext: pickingContext} = usePickingContext();
  const {colorStates, depthStencilState, colorInput, colorSpace, samples} = isPicking ? pickingContext : renderContext;

  // Vertex data
  const vertexBuffers = useMemo(() =>
    makeVertexBuffers(device, mesh.vertices), [device, mesh]);

  // Texture data
  const sourceTexture = useMemo(() => {
    const t = makeRawTexture(device, texture);
    uploadDataTexture(device, t, texture);
    return t;
  }, [device, texture]);

  // Defines
  const toColorSpace = useNativeColor(colorInput, colorSpace);
  const defines = {
    '@group(GLOBAL)': '@group(0)',
    '@group(LIGHT)': '@group(0)',
    '@binding(LIGHT)': '@binding(1)',
    'PICKING_ID': id,
    'UV_PICKING': false,
  };

  // Shader
  const vertexShader   = isPicking ? instanceDrawMeshPick         : instanceDrawMesh;
  const fragmentShader = isPicking ? instanceFragmentPickGeometry : instanceFragmentMesh;

  const inspect = useInspectable();

  // Rendering pipeline
  const pipeline = useMemo(() => {
    const vertexLinked = linkBundle(vertexShader, {toColorSpace}, defines);
    const fragmentLinked = linkBundle(fragmentShader, {toColorSpace}, defines);

    const vertex = makeShaderModuleDescriptor(
      vertexLinked,
      vertexShader.hash ?? 0,
      'main',
      getBundleLabel(vertexShader)
    );
    const fragment = makeShaderModuleDescriptor(
      fragmentLinked,
      fragmentShader.hash ?? 0,
      'main',
      getBundleLabel(fragmentShader)
    );

    inspect({vertex});
    inspect({fragment});

    return makeRenderPipeline(
      device,
      vertex,
      fragment,
      colorStates,
      depthStencilState,
      samples,
      {
        primitive: {
          topology: "triangle-list",
          cullMode: "back",
        },
        vertex:   {buffers: mesh.attributes},
        fragment: {},
      }
    );
  }, [device, colorStates, depthStencilState, samples, toColorSpace]);

  // Uniforms
  const [uniform, sampled] = useMemo(() => {
    const meshDefs = MESH_UNIFORM_DEFS;
    const defs = isPicking ? [viewDefs] : [viewDefs, meshDefs];
    const uniform = makeMultiUniforms(device, pipeline, defs, 0);

    let sampled;
    if (!isPicking) {
      const sampler = makeSampler(device, { });
      sampled = makeTextureBinding(device, pipeline, sourceTexture, sampler, 1);
    }

    return [uniform, sampled];
  }, [device, viewDefs, isPicking, pipeline]);

  // Return a lambda back to parent(s)
  const draw = (passEncoder: GPURenderPassEncoder) => {
    const l = blinkState ? 1 : 0.5;

    uniform.pipe.fill(viewUniforms);
    uniform.pipe.fill({ lightPosition: LIGHT, lightColor: [l, l, l, 1] });
    uploadBuffer(device, uniform.buffer, uniform.pipe.data);

    passEncoder.setPipeline(pipeline);
    passEncoder.setBindGroup(0, uniform.bindGroup);
    if (sampled) passEncoder.setBindGroup(1, sampled);
    passEncoder.setVertexBuffer(0, vertexBuffers[0]);
    passEncoder.draw(mesh.count, 1, 0, 0);

    // Restore bind group 0
    unbind(passEncoder);
  };

  return quote(yeet({
    // Optionally pass `bounds` of type Lazy<DataBounds> to enable culling
    [mode]: {draw}
  }));
}, 'Mesh');
