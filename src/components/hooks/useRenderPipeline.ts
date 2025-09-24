import { ShaderModuleDescriptor, DeepPartial } from '@use-gpu/core/types';

import { CanvasRenderingContextGPU } from '@use-gpu/webgpu/types';
import { makeRenderPipeline } from '@use-gpu/core';
import { useMemo, useOne } from '@use-gpu/live';
import { useMemoKey } from './useMemoKey';
import LRU from 'lru-cache';

const DEBUG = false;

const NO_DEPS = [] as any[];
const NO_LIBS = {} as Record<string, any>;

type RenderShader = [ShaderModuleDescriptor, ShaderModuleDescriptor];

export const makePipelineCache = (options: Record<string, any> = {}) => new LRU<string, any>({
  max: 100,
  ...options,
});

const CACHE = new WeakMap<any, LRU<string, any>>();

export const useRenderPipeline = (
  renderContext: CanvasRenderingContextGPU,
  shader: RenderShader,
  props: DeepPartial<GPURenderPipelineDescriptor>,
) => {
  const {device, colorStates, depthStencilState, samples} = renderContext;

  const memoKey = useMemoKey(
    [device, colorStates, depthStencilState, props]
  );

  return useMemo(() => {
    let cache = CACHE.get(memoKey);
    if (!cache) {
      DEBUG && console.log('pipeline cache created', memoKey.__id)
      CACHE.set(memoKey, cache = makePipelineCache());
    }

    const [vertex, fragment] = shader;
    const key = vertex.hash.toString() + fragment.hash.toString();
    const cached = cache.get(key);
    if (cached) {
      DEBUG && console.log('pipeline cache hit', key)
      return cached;
    }

    const pipeline = makeRenderPipeline(
      renderContext,
      vertex,
      fragment,
      props,
    );
    cache.set(key, pipeline);
    DEBUG && console.log('pipeline cache miss', key)
    return pipeline;
  }, [memoKey, samples]);
};
