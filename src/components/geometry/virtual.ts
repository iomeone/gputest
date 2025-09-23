import { LiveComponent } from '@use-gpu/live/types';
import {
  TypedArray, ViewUniforms, UniformPipe, UniformAttribute, UniformAttributeValue, UniformType,
  VertexData, StorageSource, RenderPassMode, DeepPartial,
} from '@use-gpu/core/types';
import { ParsedBundle, ParsedModule } from '@use-gpu/shader/types';
import { ViewContext, RenderContext, PickingContext, useNoPicking } from '@use-gpu/components';
import { yeet, memo, useContext, useSomeContext, useNoContext, useMemo, useOne, useState, useResource } from '@use-gpu/live';
import {
  makeMultiUniforms, makeUniformsWithStorage,
  makeRenderPipeline,
  extractDataBindings, extractCodeBindings,
  uploadBuffer,
} from '@use-gpu/core';
import { useBoundStorage } from '../hooks/useBoundStorage';
import { useBoundShader } from '../hooks/useBoundShader';

import instanceDrawVirtual from '@use-gpu/glsl/instance/draw/virtual.glsl';
import instanceDrawWireframeStrip from '@use-gpu/glsl/instance/draw/wireframe-strip.glsl';
import instanceFragmentSolid from '@use-gpu/glsl/instance/fragment/solid.glsl';

export type VirtualProps = {
  topology: GPUPrimitiveTopology,
  vertexCount: number,
  instanceCount: number,

  attributes: UniformAttributeValue[],
  lambdas: UniformAttributeValue[],

  attrBindings: any[],
  lambdaBindings: any[],

  links: Record<string, ParsedBundle | ParsedModule>
  defines: Record<string, any>,
  deps: any[],

  pipeline: DeepPartial<GPURenderPipelineDescriptor>,
  mode?: RenderPassMode | string,
  id?: number,
};

const getDebugShader = (topology: GPUPrimitiveTopology) => {
  if (topology === 'triangle-strip') return instanceDrawWireframeStrip;
  // TODO
  if (topology === 'triangle-list') return instanceDrawWireframeStrip;
  return instanceDrawWireframeStrip;
}

export const Virtual: LiveComponent<VirtualProps> = memo((fiber) => (props) => {
  const {
    attributes: propAttributes,
    lambdas: propLambdas,
    links: propLinks,
    defines: propDefines,

    attrBindings,
    lambdaBindings,

    vertexCount,
    instanceCount,

    pipeline: propPipeline,
    deps = null,
    mode = RenderPassMode.Opaque,
    id = 0,
  } = props;

  // Render set up
  const {viewUniforms, viewDefs} = useContext(ViewContext);
  const renderContext = useContext(RenderContext);

  const isDebug = mode === RenderPassMode.Debug;
  const isPicking = mode === RenderPassMode.Picking;
  const pickingContext = isPicking ? useSomeContext(PickingContext) : useNoContext(PickingContext);  
  const {pickingDefs, pickingUniforms} = pickingContext?.usePicking(id) ?? useNoPicking();

  const resolvedContext = pickingContext?.renderContext ?? renderContext;
  const {device, colorStates, depthStencilState, samples, languages} = resolvedContext;

  // External bindings
  const dataBindings = useOne(() => extractDataBindings(propAttributes, attrBindings), attrBindings);
  const codeBindings = useOne(() => extractCodeBindings(propLambdas, lambdaBindings), lambdaBindings);

  // Render shader
  const {glsl: {modules}} = languages;
  // TODO: non-strip topology
  const topology = propPipeline.primitive?.topology ?? 'triangle-list';
  const vertexShader = !isDebug ? instanceDrawVirtual : getDebugShader(topology);
  const fragmentShader = instanceFragmentSolid;

  const defines = useMemo(() => ({
    ...propDefines,
    IS_PICKING: isPicking,
    VIEW_BINDING: 0,
    PICKING_BINDING: 1,
  }), [isPicking, propDefines]);

  const links = useMemo(() => ({
    ...propLinks,
    ...codeBindings.links,
  }), [codeBindings, propLinks]);

  // Shader data bindings
  const {accessors, attributes, lambdas, constants} = useBoundStorage(
    propAttributes,
    propLambdas,
    dataBindings,
    codeBindings,
    1,
  );

  // Shaders
  const [vertex, fragment] = useBoundShader(
    vertexShader,
    fragmentShader,
    links as any,
    accessors,
    defines,
    languages,
    deps,
    1,
  );

  // Rendering pipeline
  const pipeline = useMemo(() => {
    return makeRenderPipeline(
      resolvedContext,
      vertex,
      fragment,
      propPipeline,
    );
  }, [device, vertex, fragment, propPipeline, colorStates, depthStencilState, samples, languages]);

  // Uniforms
  const [
    uniform,
    storage,
  ] = useMemo(() => {
    const defs = isPicking ? [viewDefs, pickingDefs] : [viewDefs];
    const uniform = makeMultiUniforms(device, pipeline, defs, 0);
    const storage = makeUniformsWithStorage(device, pipeline, constants, dataBindings.links, 1);
    return [uniform, storage];
  }, [device, viewDefs, constants, attributes, pipeline, dataBindings]);

  // Return a lambda back to parent(s)
  return yeet({
    [mode]: (passEncoder: GPURenderPassEncoder) => {
      uniform.pipe.fill(viewUniforms);
      if (isPicking) uniform.pipe.fill(pickingUniforms);
      uploadBuffer(device, uniform.buffer, uniform.pipe.data);

      storage.pipe.fill(dataBindings.constants);
      storage.pipe.fill(codeBindings.constants);
      uploadBuffer(device, storage.buffer, storage.pipe.data);

      passEncoder.setPipeline(pipeline);
      passEncoder.setBindGroup(0, uniform.bindGroup);
      passEncoder.setBindGroup(1, storage.bindGroup);

      if (!isDebug) passEncoder.draw(vertexCount, instanceCount, 0, 0);
      else {
        if (topology === 'triangle-strip') {
          const tris = vertexCount - 2;
          const edges = tris * 2 + 1;
          passEncoder.draw(4, edges * instanceCount, 0, 0);
        }
        if (topology === 'triangle-list') {
          passEncoder.draw(4, vertexCount * instanceCount, 0, 0);
        }
      }
    },
  }); 
}, 'Virtual');
