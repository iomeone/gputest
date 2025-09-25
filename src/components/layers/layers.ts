import { LiveComponent, LiveFunction, LiveElement } from '@use-gpu/live/types';
import { AggregateBuffer, UniformType, TypedArray, StorageSource } from '@use-gpu/core/types';
import { LayerAggregator, LayerAggregate, PointAggregate, LineAggregate, RectangleAggregate, LayerType } from './types';

import { RenderContext } from '../providers/render-provider';
import { use, resume, multiGather, useContext, useOne, useMemo } from '@use-gpu/live';
import {
  makeAggregateBuffer,
  updateAggregateBuffer,
  updateAggregateSegments,
} from '@use-gpu/core';

import { Lines } from './lines';
import { Points } from './points';

export type AggregateProps = {
  children: LiveElement<any>,
};

const allCount = (a: number, b: LayerAggregate): number => a + b.count + ((b as any).isLoop ? 3 : 0);

const allKeys = (a: Set<string>, b: LayerAggregate): Set<string> => {
  for (let k in b) a.add(k);
  return a;
}

const getItemSummary = (items: LayerAggregate[]) => {
  const keys = items.reduce(allKeys, new Set());
  const count = items.reduce(allCount, 0);
  const memoKey = Array.from(keys).join('/');

  return {keys, count, memoKey};
}

export const Layers: LiveComponent<AggregateProps> = (props) => {
  const {children} = props;
  return multiGather(children, Resume);
};

const Resume = resume((aggregates: Record<string, LayerAggregate[]>) => 
  Object.keys(AGGREGATORS).map((type: string) => {
    const makeAggregator = AGGREGATORS[type]!;
    return aggregates[type] ? use(Layer, type)(makeAggregator, aggregates[type]) : null;
  })
);

const Layer: LiveFunction<any> = (
  makeAggregator: LayerAggregator,
  items: LayerAggregate[],
) => {
  const {device} = useContext(RenderContext);
  const {keys, count, memoKey} = getItemSummary(items);

  // Invalidate storage if too small, or set of keys changes.
  const sizeRef = useOne(() => ({ current: 0 }));
  const versionRef = useOne(() => ({ current: 0 }));
  if (sizeRef.current < count) {
    versionRef.current++;

    // Grow by at least 20%
    sizeRef.current = Math.max(count, (Math.round(sizeRef.current * 1.2) | 0x7) + 1);
  }
  useOne(() => versionRef.current++, memoKey);

  const render = useMemo(() =>
    makeAggregator(device, items, keys, sizeRef.current),
    [versionRef.current]
  );
  
  return render(items);
};

const makePointAccumulator = (
  device: GPUDevice,
  items: PointAggregate[],
  keys: Set<string>,
  count: number,
) => {
  const storage = {} as Record<string, AggregateBuffer>;

  const hasPosition = keys.has('positions') || keys.has('position');
  const hasColor = keys.has('colors') || keys.has('color');
  const hasSize = keys.has('sizes') || keys.has('size');
  const hasDepth = keys.has('depths') || keys.has('depth');

  if (hasPosition) storage.positions = makeAggregateBuffer(device, UniformType['vec4<f32>'], count);
  if (hasColor) storage.colors = makeAggregateBuffer(device, UniformType['vec4<f32>'], count);
  if (hasSize) storage.sizes = makeAggregateBuffer(device, UniformType.f32, count);
  if (hasDepth) storage.depth = makeAggregateBuffer(device, UniformType.f32, count);

  return (items: PointAggregate[]) => {
    const count = items.reduce(allCount, 0);
    const props = {count, shape: 'circle'} as Record<string, any>;

    if (hasPosition) props.positions = updateAggregateBuffer(device, storage.positions, items, count, 'position', 'positions');
    if (hasColor) props.colors = updateAggregateBuffer(device, storage.colors, items, count, 'color', 'colors');
    if (hasSize) props.sizes = updateAggregateBuffer(device, storage.sizes, items, count, 'size', 'sizes');
    if (hasDepth) props.depth = updateAggregateBuffer(device, storage.depth, items, count, 'depth', 'depths');

    return use(Points)(props);
  };
}

const makeLineAccumulator = (
  device: GPUDevice,
  items: LineAggregate[],
  keys: Set<string>,
  count: number,
) => {
  const storage = {} as Record<string, AggregateBuffer>;

  const hasPosition = keys.has('positions') || keys.has('position');
  const hasSegment = keys.has('segments') || keys.has('segment');
  const hasColor = keys.has('colors') || keys.has('color');
  const hasSize = keys.has('sizes') || keys.has('size');
  const hasDepth = keys.has('depths') || keys.has('depth');

  storage.segments = makeAggregateBuffer(device, UniformType.i32, count);

  if (hasPosition) storage.positions = makeAggregateBuffer(device, UniformType['vec4<f32>'], count);
  if (hasColor) storage.colors = makeAggregateBuffer(device, UniformType['vec4<f32>'], count);
  if (hasSize) storage.sizes = makeAggregateBuffer(device, UniformType.f32, count);
  if (hasDepth) storage.depth = makeAggregateBuffer(device, UniformType.f32, count);

  return (items: LineAggregate[]) => {
    const count = items.reduce(allCount, 0);
    const props = {count, join: 'miter'} as Record<string, any>;

    if (hasSegment) props.segments = updateAggregateBuffer(device, storage.segments, items, count, 'segment', 'segments');
    else props.segments = updateAggregateSegments(device, storage.segments, items, count);

    if (hasPosition) props.positions = updateAggregateBuffer(device, storage.positions, items, count, 'position', 'positions');
    if (hasColor) props.colors = updateAggregateBuffer(device, storage.colors, items, count, 'color', 'colors');
    if (hasSize) props.sizes = updateAggregateBuffer(device, storage.sizes, items, count, 'size', 'sizes');
    if (hasDepth) props.depth = updateAggregateBuffer(device, storage.depth, items, count, 'depth', 'depths');    

    return use(Lines)(props);
  };
};

const AGGREGATORS = {
  [LayerType.Line]: makeLineAccumulator,
  [LayerType.Point]: makePointAccumulator,
} as Record<string, LayerAggregator>;
