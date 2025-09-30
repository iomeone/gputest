import type { ArchetypeSchema, AggregateItem, ArrayAggregateBuffer } from '@use-gpu/core';

import { useDeviceContext } from '../providers/device-provider';
import { useMemo, useOne } from '@use-gpu/live';
import {
  schemaToAggregate,
  toGPUAggregate,
  updateAggregateFromSchema,
  uploadAggregateFromSchema,
  uploadAggregateFromSchemaRefs,
  getAggregateSummary,
} from '@use-gpu/core';
import { useBufferedSize } from '../hooks/useBufferedSize';
import { getInstancedAggregate, combineInstances } from '../hooks/useInstancedSources';
import { getStructAggregate } from '../hooks/useStructSources';

const DEBUG = false;

export const useAggregator = (
  schema: ArchetypeSchema,
  items: AggregateItem[],
) => {
  const device = useDeviceContext();
  const {archetype, count, indexed, instanced, offsets} = useOne(() => getAggregateSummary(items), items);

  const allocInstances = useBufferedSize(instanced);
  const allocVertices = useBufferedSize(count);
  const allocIndices = useBufferedSize(indexed);

  const aggregate = useMemo(() => (
    makeAggregator(schema)(device, items, allocInstances, allocVertices, allocIndices)),
    [archetype, allocInstances, allocVertices, allocIndices]
  );

  return useOne(() => aggregate(items, count, indexed, instanced, offsets), items);
};

export const makeAggregator = (
  schema: ArchetypeSchema,
) => (
  device: GPUDevice,
  initialItems: AggregateItem[],
  allocInstances: number,
  allocVertices: number,
  allocIndices: number,
) => {
  const [item] = initialItems;
  const {attributes, refs} = item;

  const cpuAggregate = schemaToAggregate(schema, attributes, refs, allocInstances, allocVertices, allocIndices);
  const aggregate = toGPUAggregate(device, cpuAggregate);

  const {aggregateBuffers, byRefs, byInstances, byVertices, byIndices, bySelfs} = aggregate;
  const instances = aggregateBuffers.instances as ArrayAggregateBuffer;

  const refSources  = byRefs && getInstancedAggregate(byRefs, instances?.source);
  const itemSources = byInstances && getInstancedAggregate(byInstances, instances?.source);

  const sources = {
    ...combineInstances(refSources, itemSources),
    ...(byVertices ? getStructAggregate(byVertices) : undefined),
    ...(byIndices  ? getStructAggregate(byIndices)  : undefined),
    ...bySelfs?.sources,
  };

  const uploadRefs = byRefs ? () => {
    uploadAggregateFromSchemaRefs(device, schema, aggregate);
  } : null;

  DEBUG && console.log('useAggregator', {initialItems, aggregate, allocInstances, allocVertices, allocIndices});

  return (items: AggregateItem[], count: number, indexed: number, instanced: number, offsets: number[]) => {
    updateAggregateFromSchema(schema, aggregate, items, count, indexed, instanced, offsets);
    uploadAggregateFromSchema(device, schema, aggregate);

    return {count: indexed, sources, uploadRefs};
  };
};
