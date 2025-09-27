import type { UseRenderingContextGPU, ShaderModuleDescriptor, DeepPartial } from '@use-gpu/core';

import { makeRenderPipeline, makeRenderPipelineAsync } from '@use-gpu/core';
import { useContext, useMemo, useOne, useState } from '@use-gpu/live';
import { useMemoKey } from './useMemoKey';
import { DeviceContext } from '../providers/device-provider';
import LRU from 'lru-cache';

const DEBUG = false;

const NO_DEPS = [] as any[];
const NO_LIBS = {} as Record<string, any>;

type RenderShader = [ShaderModuleDescriptor, ShaderModuleDescriptor];

export const makePipelineCache = (options: Record<string, any> = {}) => new LRU<string, any>({
  max: 100,
  ...options,
});

let SHADER_LOG: LRU<string, any> | null = null;

const CACHE = new WeakMap<any, LRU<string, any>>();
const PENDING = new WeakMap<any, Map<string, any>>();

export const useRenderPipeline = (
  renderContext: UseRenderingContextGPU,
  shader: RenderShader,
  props: DeepPartial<GPURenderPipelineDescriptor>,
) => {
  const device = useContext(DeviceContext);
  const {colorStates, depthStencilState, samples} = renderContext;

  // Memo key for unique render context
  const memoKey = useMemoKey(
    [device, colorStates, depthStencilState, props]
  );

  return useMemo(() => {
    // Cache by unique render context
    let cache = CACHE.get(memoKey);
    if (!cache) {
      DEBUG && console.log('pipeline cache created', memoKey.__id)
      CACHE.set(memoKey, cache = makePipelineCache());
    }

    // Cache by shader structural hash
    const [vertex, fragment] = shader;
    const key = vertex.hash.toString() + fragment.hash.toString();

    const cached = cache.get(key);
    if (cached) {
      DEBUG && console.log('pipeline cache hit', key)
      return cached;
    }

    {
      const log = {
        colorStates,
        depthStencilState,
        props,
        vertex: {
          hash: shader[0].hash,
          code: shader[0].code,
        },
        fragment: {
          hash: shader[1].hash,
          code: shader[1].code,
        },
      };
      if (SHADER_LOG) SHADER_LOG.set(key, log);
    }

    // Make new pipeline
    const pipeline = makeRenderPipeline(
      device,
      vertex,
      fragment,
      colorStates,
      depthStencilState,
      samples,
      props,
    );
    cache.set(key, pipeline);
    DEBUG && console.log('pipeline cache miss', key);

    return pipeline;
  }, [memoKey, shader, samples]);
};

export const useRenderPipelineAsync = (
  renderContext: UseRenderingContextGPU,
  shader: RenderShader,
  props: DeepPartial<GPURenderPipelineDescriptor>,
) => {
  const device = useContext(DeviceContext);
  const {colorStates, depthStencilState, samples} = renderContext;

  // Memo key for unique render context
  const memoKey = useMemoKey(
    [device, colorStates, depthStencilState, props]
  );

  const [resolved, setResolved] = useState<GPURenderPipeline | null>(null);
  const staleRef = useOne(() => ({current: null as string | null}));

  const immediate = useMemo(() => {
    // Cache by unique render context
    let cache = CACHE.get(memoKey);
    let pending = PENDING.get(memoKey);
    if (!cache) {
      DEBUG && console.log('pipeline cache created', memoKey.__id)
      CACHE.set(memoKey, cache = makePipelineCache());
    }
    if (!pending) {
      DEBUG && console.log('pipeline pending queue created', memoKey.__id)
      PENDING.set(memoKey, pending = new Map());
    }

    // Cache by shader structural hash
    const [vertex, fragment] = shader;
    const key = vertex.hash.toString() +'-'+ fragment.hash.toString();

    const cached = cache!.get(key);
    if (cached) {
      DEBUG && console.log('async pipeline cache hit', key)
      return cached;
    }

    if (SHADER_LOG) {
      SHADER_LOG.set(key, {
        colorStates,
        depthStencilState,
        props,
        vertex: {
          hash: shader[0].hash,
          code: shader[0].code,
        },
        fragment: {
          hash: shader[1].hash,
          code: shader[1].code,
        },
      });
    }

    // Mark current pipeline as stale (if any)
    const resolve = (pipeline: GPURenderPipeline) => {
      if (staleRef.current === key) {
        staleRef.current = null;
        setResolved(pipeline);
      }
      return pipeline;
    };
    staleRef.current = key;
    DEBUG && console.log('async pipeline miss', key)

    // Mark key as pending
    if (pending!.has(key)) {
      pending!.get(key)!.then((pipeline: GPURenderPipeline) => resolve(pipeline));
      return null;
    }

    // Make new pipeline async
    const promise = makeRenderPipelineAsync(
      device,
      vertex,
      fragment,
      colorStates,
      depthStencilState,
      samples,
      props,
    );
    promise.then((pipeline: GPURenderPipeline) => {
      DEBUG && console.log('async pipeline resolved', key)

      cache!.set(key, pipeline);
      pending!.delete(key);

      return resolve(pipeline);
    });
    pending!.set(key, promise);

    return null;
  }, [memoKey, shader, samples]);

  DEBUG && console.log('async pipeline got', (immediate ?? resolved), 'stale =', staleRef.current, shader[0].hash, shader[1].hash);
  return [immediate ?? resolved, !!staleRef.current];
};

export const setShaderLog = (n: number) => SHADER_LOG = new LRU<string, any>({ max: n });
export const getShaderLog = () => {
  if (!SHADER_LOG) return [] as any;
  return SHADER_LOG.values();
}
