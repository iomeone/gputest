import type { UseGPURenderContext, ShaderModuleDescriptor, DeepPartial } from '@use-gpu/core';
import type { Update } from '@use-gpu/state';

import { makeRenderPipeline, makeRenderPipelineAsync } from '@use-gpu/core';
import { useMemo, useNoMemo, useOne, useNoOne, useState, useNoState } from '@use-gpu/live';
import { toMurmur53 } from '@use-gpu/state';
import { useMemoKey } from './useMemoKey';
import { DeviceContext } from '../providers/device-provider';
import LRU from 'lru-cache';

const DEBUG = false;

const NO_DEPS = [] as any[];
const NO_LIBS = {} as Record<string, any>;

type RenderShader = [ShaderModuleDescriptor, ShaderModuleDescriptor | null];

const makePipelineCache = (options: Record<string, any> = {}) => new LRU<string, any>({
  max: 100,
  ...options,
});

let SHADER_LOG: LRU<string, any> | null = null;

const CACHE = new WeakMap<any, LRU<string, any>>();
const PENDING = new WeakMap<any, Map<string, any>>();

export const useRenderPipeline = (
  device: GPUDevice,
  renderContext: UseGPURenderContext,
  shader: RenderShader,
  props?: DeepPartial<GPURenderPipelineDescriptor>,
  layout?: GPUPipelineLayout,
) => {
  const {colorStates, depthStencilState, samples} = renderContext;

  // Memo key for unique render context
  const pipelineKey = toMurmur53([colorStates, depthStencilState, samples, props, !!layout]);

  return useMemo(() => {
    // Cache by unique render context
    let cache = CACHE.get(device);
    if (!cache) {
      DEBUG && console.log('render pipeline cache created');
      CACHE.set(device, cache = makePipelineCache());
    }

    // Cache by shader structural hash
    const [vertex, fragment] = shader;
    const key = pipelineKey.toString() +'/'+ vertex.hash.toString() +'-'+ (fragment ? fragment.hash.toString() : 0);

    const cached = cache.get(key);
    if (cached) {
      DEBUG && console.log('render pipeline cache hit', key);
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
        fragment: shader[1] ? {
          hash: shader[1].hash,
          code: shader[1].code,
        } : null,
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
      layout,
    );
    cache.set(key, pipeline);
    DEBUG && console.log('render pipeline cache miss', key);

    return pipeline;
  }, [device, pipelineKey, shader[0].hash, shader[1] ? shader[1].hash : 0]);
};

export const useNoRenderPipeline = useNoMemo;

export const useRenderPipelineAsync = (
  device: GPUDevice,
  renderContext: UseGPURenderContext,
  shader: RenderShader,
  props?: Update<GPURenderPipelineDescriptor>,
  layout?: GPUPipelineLayout,
) => {
  const {colorStates, depthStencilState, samples} = renderContext;

  // Memo key for unique render context
  const pipelineKey = toMurmur53([colorStates, depthStencilState, samples, props, !!layout]);

  const [resolved, setResolved] = useState<GPURenderPipeline | null>(null);
  const staleRef = useOne(() => ({current: null as string | null}));

  const immediate = useMemo(() => {
    // Cache by unique render context
    let cache = CACHE.get(device);
    let pending = PENDING.get(device);
    if (!cache) {
      DEBUG && console.log('async render pipeline cache created');
      CACHE.set(device, cache = makePipelineCache());
    }
    if (!pending) {
      DEBUG && console.log('async render pipeline pending queue created');
      PENDING.set(device, pending = new Map());
    }

    // Cache by shader structural hash
    const [vertex, fragment] = shader;
    const key = pipelineKey.toString() +'/'+ vertex.hash.toString() +'-'+ (fragment ? fragment.hash.toString() : 0);

    const cached = cache!.get(key);
    if (cached) {
      DEBUG && console.log('async render pipeline cache hit', key);
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
        fragment: shader[1] ? {
          hash: shader[1].hash,
          code: shader[1].code,
        } : null,
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
    DEBUG && console.log('async render pipeline miss', key);

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
      layout,
    );
    promise.then((pipeline: GPURenderPipeline) => {
      DEBUG && console.log('async render pipeline resolved', key);

      cache!.set(key, pipeline);
      pending!.delete(key);

      return resolve(pipeline);
    });
    pending!.set(key, promise);

    return null;
  }, [device, pipelineKey, shader[0].hash, shader[1] ? shader[1].hash : 0]);

  DEBUG && console.log('async render pipeline got', (immediate ?? resolved), 'stale =', staleRef.current, shader[0].hash, shader[1] ? shader[1].hash : 0);
  return [immediate ?? resolved, !!staleRef.current];
};

export const useNoRenderPipelineAsync = () => {
  useNoState();
  useNoOne();
  useNoMemo();
};

export const setShaderLog = (n: number) => SHADER_LOG = new LRU<string, any>({ max: n });
export const getShaderLog = () => {
  if (!SHADER_LOG) return [] as any;
  return SHADER_LOG.values();
};
