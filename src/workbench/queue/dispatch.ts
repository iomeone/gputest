import type { LiveComponent, ArrowFunction } from '@use-gpu/live';
import type { TypedArray, StorageSource, RenderPassMode, DeepPartial, Lazy } from '@use-gpu/core';
import type { ShaderModule, ParsedBundle, ParsedModule } from '@use-gpu/shader';
import { yeet, memo, useContext, useNoContext, useMemo, useOne, useState, useResource, SUSPEND } from '@use-gpu/live';

import uniq from 'lodash/uniq';

import { useDeviceContext } from '../providers/device-provider';
import { useSuspenseContext } from '../providers/suspense-provider';

import {
  makeBoundUniforms, makeVolatileUniforms,
  uploadBuffer,
  resolve,
} from '@use-gpu/core';
import { useLinkedShader } from '../hooks/useLinkedShader';
import { useComputePipelineAsync } from '../hooks/useComputePipeline';
import { useInspectable } from '../hooks/useInspectable'

import keyBy from 'lodash/keyBy';
import mapValues from 'lodash/mapValues';

export type DispatchProps = {
  size?: Lazy<number[]>,
  shader: ParsedBundle,
  defines?: Record<string, any>,
  indirect?: StorageSource,
  shouldDispatch?: () => boolean | number | undefined,
  onDispatch?: () => void,
};

const NO_SIZE = [1];
const NO_CALL: Record<string, ArrowFunction> = {};

const DEFAULT_DEFINES = {
  '@group(VIRTUAL)': '@group(0)',
  '@group(VOLATILE)': '@group(1)',
};

export const Dispatch = (props: DispatchProps) => {
  // Return a lambda back to parent(s)
  return yeet(dispatch(props));
};

// Inlined into <Component>
export const dispatch = (props: DispatchProps) => {
  const {
    size = NO_SIZE,
    indirect,
    shader: computeShader,
    defines: propDefines,
    shouldDispatch,
    onDispatch,
  } = props;

  const inspect = useInspectable();

  // Dispatch set up
  const device = useDeviceContext();
  const suspense = useSuspenseContext();
  const defines = useOne(() => (propDefines ? {
    ...DEFAULT_DEFINES,
    ...propDefines,
  } : DEFAULT_DEFINES), propDefines);

  // Shader
  const {
    shader: [module],
    uniforms,
    bindings,
    constants,
    volatiles,
  } = useLinkedShader(
    [computeShader],
    defines,
  );
  
  // Rendering pipeline
  const [pipeline, isStale] = useComputePipelineAsync(device, module);

  if (!pipeline) return suspense ? SUSPEND : NO_CALL;
  if (isStale) return SUSPEND;

  // Bound storage
  const force = !!volatiles.length;
  const storage = useMemo(() =>
    makeBoundUniforms(device, pipeline, uniforms, bindings, 0, force),
    [device, pipeline, uniforms, bindings]);

  // Volatile storage
  const volatile = useMemo(() =>
    makeVolatileUniforms(device, pipeline, volatiles, 1),
    [device, pipeline, uniforms, volatiles]
  );

  const inspected = inspect({
    render: {
      dispatches: 0,
      version: null,
    },
  });
  
  let dispatchVersion: number | null = null;

  let compute = (passEncoder: GPUComputePassEncoder, countDispatch: (d: number) => void) => {
    onDispatch && onDispatch();

    const s = resolve(size ?? NO_SIZE);
    const d = s.reduce((a: number, b: number) => a * (b || 1), 1);

    inspected.render.dispatches = d;
    inspected.render.version = dispatchVersion;
    countDispatch(d);

    /*
    const bs = [];
    for (const b of bindings) if (b.storage) bs.push(b.storage.version);
    for (const b of volatiles) if (b.storage) bs.push(b.storage.version);
    console.log('dispatch', computeShader.module.name, bs)
    */

    if (storage.pipe && storage.buffer) {
      storage.pipe.fill(constants);
      uploadBuffer(device, storage.buffer, storage.pipe.data);
    }

    passEncoder.setPipeline(pipeline);
    if (storage.bindGroup) passEncoder.setBindGroup(0, storage.bindGroup);
    if (volatile.bindGroup) passEncoder.setBindGroup(1, volatile.bindGroup());

    if (indirect) passEncoder.dispatchWorkgroupsIndirect(indirect.buffer, indirect.byteOffset ?? 0);
    else passEncoder.dispatchWorkgroups(s[0], s[1] || 1, s[2] || 1);
  };
  
  if (shouldDispatch) {
    return {
      compute: (passEncoder: GPUComputePassEncoder, countDispatch: (d: number) => void) => {
        const d = shouldDispatch();
        if (d === false) return;
        if (typeof d === 'number') {
          if (dispatchVersion === d) return;
          dispatchVersion = d;
        }
        
        return compute(passEncoder, countDispatch);
      },
    };
  }
 
  return {compute};
};
