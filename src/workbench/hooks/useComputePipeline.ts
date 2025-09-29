import type { ShaderModuleDescriptor } from '@use-gpu/core';

import { makeComputePipeline, makeComputePipelineAsync } from '@use-gpu/core';
import { useMemo, useOne, useState } from '@use-gpu/live';
import LRU from 'lru-cache';

const DEBUG = false;

const NO_DEPS = [] as any[];
const NO_LIBS = {} as Record<string, any>;

type ComputeShader = ShaderModuleDescriptor;

const makePipelineCache = (options: Record<string, any> = {}) => new LRU<string, any>({
  max: 100,
  ...options,
});

let SHADER_LOG: LRU<string, any> | null = null;

const CACHE = new WeakMap<any, LRU<string, any>>();
const PENDING = new WeakMap<any, Map<string, any>>();

export const useComputePipeline = (
  device: GPUDevice,
  shader: ComputeShader,
  layout?: GPUPipelineLayout,
) => {
  const memoKey = device;

  return useMemo(() => {
    // Cache by unique device context
    let cache = CACHE.get(memoKey);
    if (!cache) {
      DEBUG && console.log('compute pipeline cache created');
      CACHE.set(memoKey, cache = makePipelineCache());
    }

    // Cache by shader structural hash
    const key = shader.hash.toString();

    const cached = cache.get(key);
    if (cached) {
      DEBUG && console.log('compute pipeline cache hit', key);
      return cached;
    }

    {
      const log = {
        compute: {
          hash: shader.hash,
          code: shader.code,
        },
      };
      if (SHADER_LOG) SHADER_LOG.set(key, log);
    }

    // Make new pipeline
    const pipeline = makeComputePipeline(
      device,
      shader,
      layout,
    );
    cache.set(key, pipeline);
    DEBUG && console.log('compute pipeline cache miss', key);

    return pipeline;
  }, [device, shader.hash]);
};

export const useComputePipelineAsync = (
  device: GPUDevice,
  shader: ComputeShader,
  layout?: GPUPipelineLayout,
) => {
  const [resolved, setResolved] = useState<GPUComputePipeline | null>(null);
  const staleRef = useOne(() => ({current: null as string | null}));

  const immediate = useMemo(() => {
    // Cache by unique device context
    let cache = CACHE.get(device);
    let pending = PENDING.get(device);
    if (!cache) {
      DEBUG && console.log('async compute pipeline cache created');
      CACHE.set(device, cache = makePipelineCache());
    }
    if (!pending) {
      DEBUG && console.log('async compute pipeline pending queue created');
      PENDING.set(device, pending = new Map());
    }

    // Cache by shader structural hash
    const key = shader.hash.toString();

    const cached = cache!.get(key);
    if (cached) {
      DEBUG && console.log('async compute pipeline cache hit', key)
      return cached;
    }

    if (SHADER_LOG) {
      SHADER_LOG.set(key, {
        compute: {
          hash: shader.hash,
          code: shader.code,
        },
      });
    }

    // Mark current pipeline as stale (if any)
    const resolve = (pipeline: GPUComputePipeline) => {
      if (staleRef.current === key) {
        staleRef.current = null;
        setResolved(pipeline);
      }
      return pipeline;
    };
    staleRef.current = key;
    DEBUG && console.log('async compute pipeline miss', key);

    // Mark key as pending
    if (pending!.has(key)) {
      pending!.get(key)!.then((pipeline: GPUComputePipeline) => resolve(pipeline));
      return null;
    }

    // Make new pipeline async
    const promise = makeComputePipelineAsync(
      device,
      shader,
      layout,
    );
    promise.then((pipeline: GPUComputePipeline) => {
      DEBUG && console.log('async compute pipeline resolved', key);

      cache!.set(key, pipeline);
      pending!.delete(key);

      return resolve(pipeline);
    });
    pending!.set(key, promise);

    return null;
  }, [device, shader]);

  DEBUG && console.log('async pipeline got', (immediate ?? resolved), 'stale =', staleRef.current, shader.hash, shader.hash);
  return [immediate ?? resolved, !!staleRef.current];
};

/*
export const setShaderLog = (n: number) => SHADER_LOG = new LRU<string, any>({ max: n });
export const getShaderLog = () => {
  if (!SHADER_LOG) return [] as any;
  return SHADER_LOG.values();
}
*/