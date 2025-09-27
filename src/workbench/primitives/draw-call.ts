import type { LiveComponent } from '@use-gpu/live';
import type {
  TypedArray, ViewUniforms, UniformPipe, UniformAttribute, UniformAttributeValue, UniformType,
  VertexData, StorageSource, RenderPassMode, DeepPartial, Lazy, UseRenderingContextGPU,
} from '@use-gpu/core';
import type { ShaderModule, ParsedBundle, ParsedModule } from '@use-gpu/shader';
import { yeet, memo, suspend, useContext, useNoContext, useFiber, useMemo, useOne, useState, useResource } from '@use-gpu/live';

import { DeviceContext } from '../providers/device-provider';
import { ViewContext } from '../providers/view-provider';

import {
  makeMultiUniforms, makeBoundUniforms, makeVolatileUniforms,
  uploadBuffer,
  resolve,
} from '@use-gpu/core';
import { useLinkedShader } from '../hooks/useLinkedShader';
import { useRenderPipelineAsync, setShaderLog, getShaderLog } from '../hooks/useRenderPipeline';
import { useInspectable } from '../hooks/useInspectable'

import keyBy from 'lodash/keyBy';
import mapValues from 'lodash/mapValues';

export type RenderProps = {
  pipeline: DeepPartial<GPURenderPipelineDescriptor>,
  mode?: RenderPassMode | string,
  id?: number,

  vertexCount: Lazy<number>,
  instanceCount: Lazy<number>,

  vertex: ParsedBundle,
  fragment: ParsedBundle,
  
  renderContext: UseRenderingContextGPU,

  defines: Record<string, any>,
};

const DEFAULT_DEFINES = {
  '@group(VIEW)': '@group(0)',
  '@binding(VIEW)': '@binding(0)',
  '@group(VIRTUAL)': '@group(1)',
  '@group(VOLATILE)': '@group(2)',
};

// Inlined into <Virtual>
export const drawCall = (props: RenderProps) => {
  const {
    vertexCount,
    instanceCount,
    vertex: vertexShader,
    fragment: fragmentShader,

    renderContext,

    pipeline: propPipeline,
    defines: propDefines,
    mode = 'opaque',
    id = 0,
  } = props;

  const isPicking = mode === 'picking';
  const inspect = useInspectable();

  // Render set up
  const device = useContext(DeviceContext);
  const {viewUniforms, viewDefs} = useContext(ViewContext);

  // Render shader
  const topology = propPipeline.primitive?.topology ?? 'triangle-list';

  const defines = useOne(() => (propDefines ? {
    '@group(VIEW)': '@group(0)',
    '@binding(VIEW)': '@binding(0)',
    '@group(VIRTUAL)': '@group(1)',
    '@group(VOLATILE)': '@group(2)',
    ...propDefines,
  } : DEFAULT_DEFINES), propDefines);

  // Shaders
  const {
    shader,
    uniforms,
    bindings,
    constants,
    volatiles,
  } = useLinkedShader(
    [vertexShader, fragmentShader],
    defines,
  );
  
  // Rendering pipeline
  const [pipeline, stale] = useRenderPipelineAsync(
    renderContext,
    shader as any,
    propPipeline,
  );

  if (!pipeline) return;
  if (stale) return suspend();
  
  // Uniforms
  const uniform = useMemo(() => {
    const defs = [viewDefs];
    return makeMultiUniforms(device, pipeline, defs as any, 0);
  }, [device, viewDefs, pipeline]);

  // Bound storage
  const force = !!volatiles.length;
  const storage = useMemo(() =>
    makeBoundUniforms(device, pipeline, uniforms, bindings, 1, force),
    [device, pipeline, uniforms, bindings]);

  // Volatile storage
  const volatile = useMemo(() =>
    makeVolatileUniforms(device, pipeline, volatiles, 2),
    [device, pipeline, uniforms, volatiles]
  );

  const fiber = useFiber();

  const inspected = inspect({
    render: {
      vertexCount: 0,
      instanceCount: 0,
    },
  });
  
  const isStrip = topology === 'triangle-strip';

  // Return a lambda back to parent(s)
  return yeet({
    [mode]: (passEncoder: GPURenderPassEncoder, countGeometry: (v: number, t: number) => void) => {
      const v = resolve(vertexCount);
      const i = resolve(instanceCount);

      const t = isStrip ? (v - 2) * i : Math.floor(v * i / 3);

      inspected.render.vertexCount = v;
      inspected.render.instanceCount = i;
      inspected.render.triangleCount = t;

      countGeometry(v * i, t);

      uniform.pipe.fill(viewUniforms);
      uploadBuffer(device, uniform.buffer, uniform.pipe.data);

      if (storage.pipe && storage.buffer) {
        storage.pipe.fill(constants);
        uploadBuffer(device, storage.buffer, storage.pipe.data);
      }

      passEncoder.setPipeline(pipeline);
      passEncoder.setBindGroup(0, uniform.bindGroup);
      if (storage.bindGroup) passEncoder.setBindGroup(1, storage.bindGroup);
      if (volatile.bindGroup) passEncoder.setBindGroup(2, volatile.bindGroup());

      passEncoder.draw(v, i, 0, 0);
    },
  });
};

//setShaderLog(100);
//setTimeout(() => console.log(getShaderLog().map(s => [s.vertex.hash, s.fragment.hash])), 2000);
