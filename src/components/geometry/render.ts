import { LiveComponent } from '@use-gpu/live/types';
import {
  TypedArray, ViewUniforms, UniformPipe, UniformAttribute, UniformAttributeValue, UniformType,
  VertexData, StorageSource, RenderPassMode, DeepPartial,
} from '@use-gpu/core/types';
import { ShaderModule, ParsedBundle, ParsedModule } from '@use-gpu/shader/types';
import { ViewContext, RenderContext, PickingContext, usePickingContext } from '@use-gpu/components';
import { yeet, memo, useContext, useNoContext, useMemo, useOne, useState, useResource, useConsoleLog } from '@use-gpu/live';
import {
  makeMultiUniforms, makeBoundUniforms,
  makeRenderPipeline,
  uploadBuffer,
} from '@use-gpu/core';
import { useLinkedShader } from '../hooks/useLinkedShader';
import { useRenderPipeline } from '../hooks/useRenderPipeline';

import keyBy from 'lodash/keyBy';
import mapValues from 'lodash/mapValues';

export type RenderProps = {
  pipeline: DeepPartial<GPURenderPipelineDescriptor>,
  mode?: RenderPassMode | string,
  id?: number,

  vertexCount: number,
  instanceCount: number,

  vertex: ShaderModule,
  fragment: ShaderModule,

  defines: Record<string, any>,
  deps: any[],
};

export const render = (props: RenderProps) => {
  const {
    vertexCount,
    instanceCount,
    vertex: vertexShader,
    fragment: fragmentShader,

    pipeline: propPipeline,
    defines: propDefines,
    deps = null,
    mode = RenderPassMode.Opaque,
    id = 0,
  } = props;

  const isDebug = mode === RenderPassMode.Debug;
  const isPicking = mode === RenderPassMode.Picking;

  // Render set up
  const {viewUniforms, viewDefs} = useContext(ViewContext);
  const {renderContext, pickingUniforms, pickingDefs} = usePickingContext(id, isPicking);
  const {device, languages} = renderContext;

  // Render shader
  // TODO: non-strip topology
  const topology = propPipeline.primitive?.topology ?? 'triangle-list';

  const defines = useMemo(() => ({
    IS_PICKING: isPicking,
    VIEW_BINDGROUP: 0,
    VIEW_BINDING: 0,
    PICKING_BINDGROUP: 0,
    PICKING_BINDING: 1,
    VIRTUAL_BINDGROUP: 1,
    ...propDefines,
  }), [isPicking, propDefines]);

  // Shaders
  const {
    shader,
    uniforms,
    bindings,
  } = useLinkedShader(
    vertexShader,
    fragmentShader,
    defines,
    languages,
    deps,
    1,
  );

  // Rendering pipeline
  const pipeline = useRenderPipeline(
    renderContext,
    shader,
    propPipeline,
  );

  // Uniforms
  const uniform = useMemo(() => {
    const defs = isPicking ? [viewDefs, pickingDefs] : [viewDefs];
    return makeMultiUniforms(device, pipeline, defs, 0);
  }, [device, viewDefs, pipeline]);

  // Bound storage
  const storage = useMemo(() =>
    makeBoundUniforms(device, pipeline, uniforms, bindings, 1),
    [device, viewDefs, uniforms, bindings, pipeline]
  );

  const uniformMap = keyBy(uniforms, ({uniform: {name}}) => name);
  const constantUniforms = mapValues(uniformMap, u => u.constant);

  // Return a lambda back to parent(s)
  return yeet({
    [mode]: (passEncoder: GPURenderPassEncoder) => {
      uniform.pipe.fill(viewUniforms);
      if (isPicking) uniform.pipe.fill(pickingUniforms);
      uploadBuffer(device, uniform.buffer, uniform.pipe.data);

      if (storage.pipe && storage.buffer) {
        storage.pipe.fill(constantUniforms);
        uploadBuffer(device, storage.buffer, storage.pipe.data);
      }

      passEncoder.setPipeline(pipeline);
      passEncoder.setBindGroup(0, uniform.bindGroup);
      if (storage.bindGroup) passEncoder.setBindGroup(1, storage.bindGroup);

      passEncoder.draw(vertexCount, instanceCount, 0, 0);
    },
  });
};
