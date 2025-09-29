import type { LiveComponent, LiveFunction, LiveElement } from '@use-gpu/live';
import type { AggregateBuffer, UniformType, TypedArray, StorageSource } from '@use-gpu/core';
import type { LayerAggregator, LayerAggregate, PointAggregate, LineAggregate, FaceAggregate } from './types';

import { DeviceContext } from '../providers/device-provider';
import { use, keyed, signal, multiGather, memo, useContext, useOne, useMemo } from '@use-gpu/live';
import {
  makeAggregateBuffer,
  updateAggregateBuffer,
  updateAggregateIndex,
  updateAggregateSegments,
  updateAggregateFaces,
} from '@use-gpu/core';
import { useBufferedSize } from '../hooks/useBufferedSize';

import { FaceLayer } from './face-layer';
import { LineLayer } from './line-layer';
import { PointLayer } from './point-layer';

export type VirtualLayersProps = {
  items?: Record<string, LayerAggregate[]>,
  children: LiveElement,
};

const allCount = (a: number, b: LayerAggregate): number => a + b.count + ((b as any).loop ? 3 : 0);

const allIndices = (a: number, b: LayerAggregate): number => a + ((b as any).indices?.length || 0);

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
  const indices = items.reduce(allIndices, 0);
  const memoKey = Array.from(keys).join('/');

  return {keys, count, indices, memoKey};
}

/** Aggregate (point / line / face) geometry from children to produce merged layers. */
export const VirtualLayers: LiveComponent<VirtualLayersProps> = memo((props: VirtualLayersProps) => {
  const {items, children} = props;
  return items ? Resume(items) : children ? multiGather(children, Resume) : null;
}, 'VirtualLayers');

const Resume = (
  aggregates: Record<string, LayerAggregate[]>,
) => {
  const els: LiveElement[] = [];

  for (const type in aggregates) {
    const items = aggregates[type];
    if (!items.length) continue;

    const makeAggregator = AGGREGATORS[type]!;
    els.push(keyed(Layer, type, makeAggregator, aggregates[type]));
  }

  els.push(signal());

  return els;
};

const Layer: LiveFunction<any> = (
  makeAggregator: LayerAggregator,
  items: LayerAggregate[],
) => {
  const device = useContext(DeviceContext);
  const {keys, count, indices, memoKey} = getItemSummary(items);

  const allocCount = useBufferedSize(count);
  const allocIndices = useBufferedSize(indices);

  const render = useMemo(() =>
    makeAggregator(device, items, keys, allocCount, allocIndices),
    [memoKey, allocCount, allocIndices]
  );
  
  return render(items, count, indices);
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
  const hasZBias = keys.has('zBiases') || keys.has('zBias');
  const hasID = keys.has('id') || keys.has('ids');
  const hasLookup = keys.has('lookup') || keys.has('lookups');

  if (hasPosition) storage.positions = makeAggregateBuffer(device, 'vec4<f32>', alloc);
  if (hasColor) storage.colors = makeAggregateBuffer(device, 'vec4<f32>', alloc);
  if (hasSize) storage.sizes = makeAggregateBuffer(device, 'f32', alloc);
  if (hasDepth) storage.depths = makeAggregateBuffer(device, 'f32', alloc);
  if (hasZBias) storage.zBiases = makeAggregateBuffer(device, 'f32', alloc);
  if (hasID) storage.ids = makeAggregateBuffer(device, 'u32', alloc);
  if (hasLookup) storage.lookups = makeAggregateBuffer(device, 'u32', alloc);

  return (items: PointAggregate[], count: number) => {
    const props = {count, shape: 'circle'} as Record<string, any>;

    if (hasPosition) props.positions = updateAggregateBuffer(device, storage.positions, items, count, 'position', 'positions');
    if (hasColor) props.colors = updateAggregateBuffer(device, storage.colors, items, count, 'color', 'colors');
    if (hasSize) props.sizes = updateAggregateBuffer(device, storage.sizes, items, count, 'size', 'sizes');
    if (hasDepth) props.depths = updateAggregateBuffer(device, storage.depths, items, count, 'depth', 'depths');
    if (hasZBias) props.zBiases = updateAggregateBuffer(device, storage.zBiases, items, count, 'zBias', 'zBiases');
    if (hasID) props.ids = updateAggregateBuffer(device, storage.ids, items, count, 'id', 'ids');
    if (hasLookup) props.lookup = updateAggregateBuffer(device, storage.lookups, items, count, 'lookup', 'lookups');

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
  const hasWidth = keys.has('widths') || keys.has('width');
  const hasDepth = keys.has('depths') || keys.has('depth');
  const hasZBias = keys.has('zBiases') || keys.has('zBias');
  const hasID = keys.has('id') || keys.has('ids');
  const hasLookup = keys.has('lookup') || keys.has('lookups');

  storage.segments = makeAggregateBuffer(device, 'i32', alloc);

  if (hasPosition) storage.positions = makeAggregateBuffer(device, 'vec4<f32>', alloc);
  if (hasColor) storage.colors = makeAggregateBuffer(device, 'vec4<f32>', alloc);
  if (hasWidth) storage.widths = makeAggregateBuffer(device, 'f32', alloc);
  if (hasDepth) storage.depths = makeAggregateBuffer(device, 'f32', alloc);
  if (hasZBias) storage.zBiases = makeAggregateBuffer(device, 'f32', alloc);
  if (hasID) storage.ids = makeAggregateBuffer(device, 'u32', alloc);
  if (hasLookup) storage.lookups = makeAggregateBuffer(device, 'u32', alloc);

  return (items: LineAggregate[], count: number) => {
    const props = {count, join: 'bevel'} as Record<string, any>;

    const {chunks, loops} = gatherItemChunks(items);

    if (hasSegment) props.segments = updateAggregateBuffer(device, storage.segments, items, count, 'segment', 'segments');
    else props.segments = updateAggregateFaces(device, storage.segments, chunks, loops, count);

    if (hasPosition) props.positions = updateAggregateBuffer(device, storage.positions, items, count, 'position', 'positions');
    if (hasColor) props.colors = updateAggregateBuffer(device, storage.colors, items, count, 'color', 'colors');
    if (hasWidth) props.widths = updateAggregateBuffer(device, storage.widths, items, count, 'width', 'widths');
    if (hasDepth) props.depths = updateAggregateBuffer(device, storage.depths, items, count, 'depth', 'depths');    
    if (hasZBias) props.zBiases = updateAggregateBuffer(device, storage.zBiases, items, count, 'zBias', 'zBiases');
    if (hasID) props.ids = updateAggregateBuffer(device, storage.ids, items, count, 'id', 'ids');
    if (hasLookup) props.lookups = updateAggregateBuffer(device, storage.lookups, items, count, 'lookup', 'lookups');

    return use(LineLayer, props);
  };
};

const makeFaceAccumulator = (
  device: GPUDevice,
  items: LineAggregate[],
  keys: Set<string>,
  allocCount: number,
  allocIndices: number,
) => {
  const storage = {} as Record<string, AggregateBuffer>;

  const hasPosition = keys.has('positions') || keys.has('position');
  const hasIndex = keys.has('indices') || keys.has('index');
  const hasSegment = keys.has('segments') || keys.has('segment');
  const hasColor = keys.has('colors') || keys.has('color');
  const hasSize = keys.has('sizes') || keys.has('size');
  const hasZBias = keys.has('zBiases') || keys.has('zBias');
  const hasID = keys.has('id') || keys.has('ids');
  const hasLookup = keys.has('lookup') || keys.has('lookups');
  const hasCullMode = keys.has('cullMode');

  if (hasIndex) storage.indices = makeAggregateBuffer(device, 'u32', allocIndices);
  else storage.segments = makeAggregateBuffer(device, 'i32', allocCount);

  if (hasPosition) storage.positions = makeAggregateBuffer(device, 'vec4<f32>', allocCount);
  if (hasColor) storage.colors = makeAggregateBuffer(device, 'vec4<f32>', allocCount);
  if (hasZBias) storage.zBiases = makeAggregateBuffer(device, 'f32', allocCount);
  if (hasID) storage.ids = makeAggregateBuffer(device, 'u32', allocCount);
  if (hasLookup) storage.lookups = makeAggregateBuffer(device, 'u32', allocCount);

  return (items: FaceAggregate[], count: number, indices: number) => {
    const props = {count} as Record<string, any>;

    const {chunks, loops} = gatherItemChunks(items);
    const offsets = accumulate(chunks);

    if (hasIndex) {
      props.indices = updateAggregateIndex(device, storage.indices, items, indices, offsets, 'index', 'indices');
    }
    else {
      if (hasSegment) props.segments = updateAggregateBuffer(device, storage.segments, items, count, 'segment', 'segments');
      else props.segments = updateAggregateSegments(device, storage.segments, chunks, loops, count);
    }

    if (hasPosition) props.positions = updateAggregateBuffer(device, storage.positions, items, count, 'position', 'positions');
    if (hasColor) props.colors = updateAggregateBuffer(device, storage.colors, items, count, 'color', 'colors');
    if (hasZBias) props.zBiases = updateAggregateBuffer(device, storage.zBiases, items, count, 'zBias', 'zBiases');
    if (hasID) props.ids = updateAggregateBuffer(device, storage.ids, items, count, 'id', 'ids');
    if (hasLookup) props.lookups = updateAggregateBuffer(device, storage.lookups, items, count, 'lookup', 'lookups');

    if (hasCullMode) props.pipeline = {primitive: {cullMode: items[0]?.cullMode}};

    return use(FaceLayer, props);
  };
};

const AGGREGATORS = {
  'face': makeFaceAccumulator,
  'line': makeLineAccumulator,
  'point': makePointAccumulator,
  'label': () => () => {},
} as Record<string, LayerAggregator>;

const accumulate = (xs: number[]): number[] => {
  let out: number[] = [];
  let n = xs.length;
  let accum = 0;
  for (let i = 0; i < n; ++i) {
    out.push(accum);
    accum += xs[i];
  }
  return out;
}
