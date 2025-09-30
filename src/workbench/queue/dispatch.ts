import type { ArrowFunction } from '@use-gpu/live';
import type { StorageSource, Lazy, VectorLike } from '@use-gpu/core';
import type { ParsedBundle } from '@use-gpu/shader';

import { yeet, useMemo, useOne, SUSPEND } from '@use-gpu/live';

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

export type DispatchProps = {
  size?: Lazy<number[] | VectorLike>,
  group?: Lazy<number[] | VectorLike>,
  shader: ParsedBundle,
  defines?: Record<string, any>,
  indirect?: StorageSource,
  shouldDispatch?: () => boolean | number | null | undefined,
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
    group,
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
    indirect,
  });

  let dispatchVersion: number | null = null;

  const compute = (passEncoder: GPUComputePassEncoder, countDispatch: (d: number, s: number) => void) => {
    onDispatch && onDispatch();

    const s = resolve(size ?? NO_SIZE);
    const m = resolve(group ?? null);

    let sx = s[0] || 1;
    let sy = s[1] || 1;
    let sz = s[2] || 1;

    const n = sx * sy * sz;
    if (m) {
      sx = Math.ceil(sx / m[0]);
      sy = Math.ceil(sy / (m[1] || 1));
      sz = Math.ceil(sz / (m[2] || 1));
    }
    const d = sx * sy * sz;

    inspected.render.samples = m ? n : 0;
    inspected.render.dispatches = d;
    inspected.render.version = dispatchVersion;
    countDispatch(d, m ? n : 0);

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
    else {
      passEncoder.dispatchWorkgroups(sx, sy, sz);
    }
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
