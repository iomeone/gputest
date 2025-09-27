import type { LiveComponent, LiveFunction, LiveElement } from '@use-gpu/live';
import type { AggregateBuffer, UniformType, TypedArray, StorageSource } from '@use-gpu/core';
import type { LayerAggregator, LayerAggregate, PointAggregate, LineAggregate } from './types';

import { DeviceContext } from '../providers/device-provider';
import { use, keyed, fragment, multiGather, useContext, useOne, useMemo } from '@use-gpu/live';
import {
  makeAggregateBuffer,
  updateAggregateBuffer,
  updateAggregateSegments,
} from '@use-gpu/core';
import { useBufferedSize } from '../hooks/useBufferedSize';

import { LineLayer } from './line-layer';
import { PointLayer } from './point-layer';

export type LayersProps = {
  children: LiveElement<any>,
};

const allCount = (a: number, b: LayerAggregate): number => a + b.count + ((b as any).loop ? 3 : 0);

const allKeys = (a: Set<string>, b: LayerAggregate): Set<string> => {
  for (let k in b) a.add(k);
  return a;
}

const gatherItemChunks = (items: LayerAggregate[]) => {
  const chunks = [] as number[];
  const loops = [] as boolean[];

  for (const item of items) {
    const {count, loop} = item as any;
    chunks.push(count);
    loops.push(!!loop);
  }

  return {chunks, loops};
};

const getItemSummary = (items: LayerAggregate[]) => {
  const keys = items.reduce(allKeys, new Set());
  const count = items.reduce(allCount, 0);
  const memoKey = Array.from(keys).join('/');

  return {keys, count, memoKey};
}

/** Aggregate (point and line) geometry from children to produce merged layers. */
export const VirtualLayers: LiveComponent<LayersProps> = (props) => {
  const {children} = props;
  return multiGather(children, Resume);
};

const Resume = (aggregates: Record<string, LayerAggregate[]>) => 
  fragment(Object.keys(AGGREGATORS).map((type: string) => {
    const makeAggregator = AGGREGATORS[type]!;
    return aggregates[type] ? keyed(Layer, type, makeAggregator, aggregates[type]) : null;
  }));

const Layer: LiveFunction<any> = (
  makeAggregator: LayerAggregator,
  items: LayerAggregate[],
) => {
  const device = useContext(DeviceContext);
  const {keys, count, memoKey} = getItemSummary(items);

  const alloc = useBufferedSize(count);

  const render = useMemo(() =>
    makeAggregator(device, items, keys, alloc),
    [memoKey, alloc]
  );
  
  return render(items, count);
};

const makePointAccumulator = (
  device: GPUDevice,
  items: PointAggregate[],
  keys: Set<string>,
  alloc: number,
) => {
  const storage = {} as Record<string, AggregateBuffer>;

  const hasPosition = keys.has('positions') || keys.has('position');
  const hasColor = keys.has('colors') || keys.has('color');
  const hasSize = keys.has('sizes') || keys.has('size');
  const hasDepth = keys.has('depths') || keys.has('depth');

  if (hasPosition) storage.positions = makeAggregateBuffer(device, 'vec4<f32>', alloc);
  if (hasColor) storage.colors = makeAggregateBuffer(device, 'vec4<f32>', alloc);
  if (hasSize) storage.sizes = makeAggregateBuffer(device, 'f32', alloc);
  if (hasDepth) storage.depth = makeAggregateBuffer(device, 'f32', alloc);

  return (items: PointAggregate[], count: number) => {
    const props = {count, shape: 'circle'} as Record<string, any>;

    if (hasPosition) props.positions = updateAggregateBuffer(device, storage.positions, items, count, 'position', 'positions');
    if (hasColor) props.colors = updateAggregateBuffer(device, storage.colors, items, count, 'color', 'colors');
    if (hasSize) props.sizes = updateAggregateBuffer(device, storage.sizes, items, count, 'size', 'sizes');
    if (hasDepth) props.depth = updateAggregateBuffer(device, storage.depth, items, count, 'depth', 'depths');

    return use(PointLayer, props);
  };
}

const makeLineAccumulator = (
  device: GPUDevice,
  items: LineAggregate[],
  keys: Set<string>,
  alloc: number,
) => {
  const storage = {} as Record<string, AggregateBuffer>;

  const hasPosition = keys.has('positions') || keys.has('position');
  const hasSegment = keys.has('segments') || keys.has('segment');
  const hasColor = keys.has('colors') || keys.has('color');
  const hasSize = keys.has('sizes') || keys.has('size');
  const hasDepth = keys.has('depths') || keys.has('depth');

  storage.segments = makeAggregateBuffer(device, 'i32', alloc);

  if (hasPosition) storage.positions = makeAggregateBuffer(device, 'vec4<f32>', alloc);
  if (hasColor) storage.colors = makeAggregateBuffer(device, 'vec4<f32>', alloc);
  if (hasSize) storage.sizes = makeAggregateBuffer(device, 'f32', alloc);
  if (hasDepth) storage.depth = makeAggregateBuffer(device, 'f32', alloc);

  return (items: LineAggregate[], count: number) => {
    const props = {count, join: 'miter'} as Record<string, any>;

    const {chunks, loops} = gatherItemChunks(items);

    if (hasSegment) props.segments = updateAggregateBuffer(device, storage.segments, items, count, 'segment', 'segments');
    else props.segments = updateAggregateSegments(device, storage.segments, chunks, loops, count);

    if (hasPosition) props.positions = updateAggregateBuffer(device, storage.positions, items, count, 'position', 'positions');
    if (hasColor) props.colors = updateAggregateBuffer(device, storage.colors, items, count, 'color', 'colors');
    if (hasSize) props.sizes = updateAggregateBuffer(device, storage.sizes, items, count, 'size', 'sizes');
    if (hasDepth) props.depth = updateAggregateBuffer(device, storage.depth, items, count, 'depth', 'depths');    

    return use(LineLayer, props);
  };
};

const AGGREGATORS = {
  'line': makeLineAccumulator,
  'point': makePointAccumulator,
} as Record<string, LayerAggregator>;
