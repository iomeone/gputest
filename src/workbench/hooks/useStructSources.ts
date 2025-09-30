import type { LambdaSource, StorageSource, StructAggregateBuffer, UniformAttribute } from '@use-gpu/core';

import { useMemo, useOne } from '@use-gpu/live';
import { explode, structType, bindEntryPoint } from '@use-gpu/shader/wgsl';
import { getSource } from './useSource';
import { getLambdaSource } from './useLambdaSource';

const toTitleCase = (s: string) => s.slice(0, 1).toUpperCase() + s.slice(1);

export const useStructSources = (
  uniforms: UniformAttribute[],
  source: StorageSource,
  name?: string,
) => (
  useMemo(() => getStructSources(uniforms, source, name), [uniforms, source, name])
);

export const getStructSources = (
  uniforms: UniformAttribute[],
  source: StorageSource,
  name?: string,
): Record<string, LambdaSource> => {

  name = name ?? 'get' + uniforms.map(u => toTitleCase(u.name)).join('');

  const type = structType(uniforms as any, name);
  const bound = getSource({name: name ?? 'storage', format: 'array<T>', type, args: null}, source);
  const exploded = explode(type, bound);

  const sources: Record<string, LambdaSource> = {};
  for (const {name} of uniforms) {
    sources[name] = getLambdaSource(bindEntryPoint(exploded, name), source);
  };

  return sources;
};

export const useStructAggregate = (
  aggregateBuffer: StructAggregateBuffer,
) => {
  return useOne(() => getStructAggregate(aggregateBuffer), aggregateBuffer)
};

export const getStructAggregate = (
  aggregateBuffer: StructAggregateBuffer,
) => {
  const {layout: {attributes}, source} = aggregateBuffer;
  const sources = getStructSources(attributes, source);
  return sources;
};

