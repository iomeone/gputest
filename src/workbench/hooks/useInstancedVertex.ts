import type { Lazy } from '../../core';
import type { ShaderModule, ShaderSource } from '../../shader';
import { resolve } from '../../core';
import { useMemo, useNoMemo } from '../../live';
import { useShaderRef, useNoShaderRef } from '../hooks/useShaderRef';
import { getShader } from '../hooks/useShader';

import { getInstanceRepeatIndex } from '../../wgsl/instance/index/repeatwgsl';
import { getInstancedVertex } from '../../wgsl/instance/vertex/instancedwgsl';

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

  }, [getVertex, instance, instances, elementCount, instanceSize, mapIndex]);
}

export const useNoInstancedVertex = () => {
  useNoShaderRef();
  useNoMemo();
};
