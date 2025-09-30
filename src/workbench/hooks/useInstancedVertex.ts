import type { Lazy } from '@use-gpu/core';
import type { ShaderModule, ShaderSource } from '@use-gpu/shader';
import { resolve } from '@use-gpu/core';
import { useMemo, useNoMemo } from '@use-gpu/live';
import { useShaderRef, useNoShaderRef } from '../hooks/useShaderRef';
import { getShader } from '../hooks/useShader';

import { getInstanceRepeatIndex } from '@use-gpu/wgsl/instance/index/repeat.wgsl';
import { getInstancedVertex } from '@use-gpu/wgsl/instance/vertex/instanced.wgsl';

const INSTANCES = {HAS_INSTANCES: true};
const NO_INSTANCES = {HAS_INSTANCES: false};

/** Instanced draw, repeated) or random access */
export const useInstancedVertex = (
  getVertex: ShaderModule,
  instance?: Lazy<number>,
  instances?: ShaderSource,
  elementCount?: Lazy<number>,
  mapIndex?: ShaderSource,
): [ShaderModule, Lazy<number>, Record<string, boolean>] => {

  if (!(instance != null || instances)) {
    useNoInstancedVertex();
    return [getVertex, elementCount || 0, NO_INSTANCES];
  }

  const instanceSize = instance == null ? useNoShaderRef() : useShaderRef(elementCount);

  return useMemo(() => {

    const mappedIndex = instanceSize
      ? getShader(getInstanceRepeatIndex, [instanceSize])
      : mapIndex;

    const boundInstance = getShader(getInstancedVertex, [getVertex, instances, mappedIndex]);

    const totalCount = () => {
      const l = resolve(elementCount) || 0;
      return instance != null ? l * resolve(instance) : l;
    };

    return [boundInstance, totalCount, INSTANCES];

  }, [instance, instances, elementCount, instanceSize]);
}

export const useNoInstancedVertex = () => {
  useNoShaderRef();
  useNoMemo();
};
