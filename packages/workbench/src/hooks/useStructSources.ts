import type { LambdaSource, StorageSource, StructAggregateBuffer, UniformAttribute, UniformSource } from '@use-gpu/core';

import { useMemo, useOne } from '@use-gpu/live';
import { explode, structType, bindEntryPoint } from '@use-gpu/shader/wgsl';
import { getSource } from './useSource';
import { getLambdaSource } from './useLambdaSource';

const toTitleCase = (s: string) => s.slice(0, 1).toUpperCase() + s.slice(1);

export const useStructSources = (
  attributes: UniformAttribute[],
  source: UniformSource | StorageSource,
  name?: string,
) => (
  useMemo(() => getStructSources(attributes, source, name), [attributes, source, name])
);

export const getStructSources = (
  attributes: UniformAttribute[],
  source: UniformSource | StorageSource,
  name?: string,
): Record<string, LambdaSource> => {

  name = name ?? 'get' + attributes.map(u => toTitleCase(u.name)).join('');

  const type = structType(attributes as any, name);
  const bound = getSource({name: name ?? source.addressSpace ?? 'storage', format: 'array<T>', type, args: null}, source);
  const exploded = explode(type, bound);

  const sources: Record<string, LambdaSource> = {};
  for (const {name} of attributes) {
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

