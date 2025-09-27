import { LiveComponent } from '@use-gpu/live/types';
import {
  TypedArray, ViewUniforms, UniformPipe, UniformAttribute, UniformAttributeValue, UniformType,
  VertexData, StorageSource, RenderPassMode, DeepPartial,
} from '@use-gpu/core/types';
import { ShaderModule, ParsedBundle, ParsedModule } from '@use-gpu/shader/types';
import { DeviceContext, ViewContext, RenderContext, PickingContext, usePickingContext } from '@use-gpu/components';
import { yeet, memo, useContext, useNoContext, useMemo, useOne, useState, useResource, useConsoleLog } from '@use-gpu/live';
import {
  makeMultiUniforms, makeBoundUniforms,
  getColorSpace,
  uploadBuffer,
  resolve,
} from '@use-gpu/core';
import { useLinkedShader } from '../hooks/useLinkedShader';
import { useRenderPipeline } from '../hooks/useRenderPipeline';

import keyBy from 'lodash/keyBy';
import mapValues from 'lodash/mapValues';

export type RenderProps = {
  pipeline: DeepPartial<GPURenderPipelineDescriptor>,
  mode?: RenderPassMode | string,
  id?: number,

  vertexCount: number | (() => number),
  instanceCount: number | (() => number),

  vertex: ParsedBundle,
  fragment: ParsedBundle,

  defines: Record<string, any>,
  deps: any[] | null,
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

  const isPicking = mode === RenderPassMode.Picking;

  // Render set up
  const device = useContext(DeviceContext);
  const {viewUniforms, viewDefs} = useContext(ViewContext);
  const {renderContext, pickingUniforms, pickingDefs} = usePickingContext(id, isPicking);
  const {colorInput, colorSpace} = renderContext;

  // Render shader
  // TODO: non-strip topology
  const topology = propPipeline.primitive?.topology ?? 'triangle-list';
  const cs = getColorSpace(colorInput, colorSpace);

  const defines = useMemo(() => ({
    '@group(VIEW)': '@group(0)',
    '@binding(VIEW)': '@binding(0)',
    '@group(PICKING)': '@group(0)',
    '@binding(PICKING)': '@binding(1)',
    '@group(VIRTUAL)': '@group(1)',
    'COLOR_SPACE': cs,
    ...propDefines,
  }), [propDefines]);

  // Shaders
  const {
    shader,
    uniforms,
    bindings,
  } = useLinkedShader(
    vertexShader,
    fragmentShader,
    defines,
    deps,
    1,
  );
  
  // Rendering pipeline
  const pipeline = useRenderPipeline(
    renderContext,
    shader as any,
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

      passEncoder.draw(resolve(vertexCount), resolve(instanceCount), 0, 0);
    },
  });
};
