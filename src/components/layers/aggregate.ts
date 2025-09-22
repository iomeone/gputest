import { LiveComponent } from '@use-gpu/live/types';
import { UniformType, TypedArray, StorageSource } from '@use-gpu/core/types';
import { LayerAggregate, LayerType } from './types';

import { RenderContext } from '../providers/render-provider';
import { use, resume, multiGather, useContext, useYolo, useOne, useMemo } from '@use-gpu/live';
import {
  makeDataArray,
  makeStorageBuffer,
  copyNumberArrayRange,
  copyNumberArrayRepeatedRange,
  copyNumberArrayCompositeRange,
  copyChunksToSegments,
  uploadBuffer,
} from '@use-gpu/core';

import { Lines } from './lines';
import { Points } from './points';
import { Rectangles } from './rectangles';

export type AggregateProps = {
  children: LiveElement<any>,
};

type AggregateBuffer = {
  buffer: GPUBuffer,
  array: TypedArray,
  dims: number,
  source: StorageSource,
};

const allCount = (a: number, b: number): number => a + b.count + (b.isLoop ? 3 : 0);

const allKeys = (a: Set<string>, b: LayerAggregate): Set<string> => {
  for (let k in b) a.add(k);
  return a;
}

export const Aggregate: LiveComponent<AggregateProps> = (props) => {
  const {children} = props;
  return multiGather(children, Resume);
};

const Resume = resume((aggregates: Record<string, LayerAggregate[]>) => 
  Object.keys(AGGREGATORS).map((type: any) => aggregates[type] ? use(Layer, type)(type, aggregates[type]) : null)
, 'Aggregate');

const Layer: LiveFunction<any> = (
  type: LayerType,
  items: LayerAggregate[],
) => {
  const {device} = useContext(RenderContext);

  const out = [] as LiveElement[];
  const aggregator = AGGREGATORS[type];
  if (!aggregator) return null;

  const [makeAggregator, Component] = aggregator;
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

  const update = useMemo(() =>
    makeAggregator(device, items, keys, sizeRef.current),
    [versionRef.current]
  );
  
  const props = update(items);
  return use(Component)(props);
};

const getItemSummary = (items: LayerAggregate[]) => {
  const keys = items.reduce(allKeys, new Set());
  const count = items.reduce(allCount, 0);
  const memoKey = Array.from(keys).join('/');

  return {keys, count, memoKey};
}

const makePointAccumulator = (
  device: GPUDevice,
  items: LineAggregate[],
  keys: Set<string>,
  count: number,
) => {
  const storage = {} as Record<string, AggregateBuffer>;

  const hasPosition = keys.has('positions') || keys.has('position');
  const hasColor = keys.has('colors') || keys.has('color');
  const hasSize = keys.has('sizes') || keys.has('size');
  const hasDepth = keys.has('depths') || keys.has('depth');

  if (hasPosition) storage.positions = makeAggregateBuffer(device, UniformType.vec4, count);
  if (hasColor) storage.colors = makeAggregateBuffer(device, UniformType.vec4, count);
  if (hasSize) storage.sizes = makeAggregateBuffer(device, UniformType.float, count);
  if (hasDepth) storage.depth = makeAggregateBuffer(device, UniformType.float, count);

  return (items: LineAggregate[]) => {
    const count = items.reduce(allCount, 0);
    const props = {count, shape: 'circle'};

    if (hasPosition) props.positions = updateAggregateBuffer(device, storage.positions, items, count, 'position', 'positions');
    if (hasColor) props.colors = updateAggregateBuffer(device, storage.colors, items, count, 'color', 'colors');
    if (hasSize) props.sizes = updateAggregateBuffer(device, storage.sizes, items, count, 'size', 'sizes');
    if (hasDepth) props.depth = updateAggregateBuffer(device, storage.depth, items, count, 'depth', 'depths');

    return props;
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

  storage.segments = makeAggregateBuffer(device, UniformType.int, count);

  if (hasPosition) storage.positions = makeAggregateBuffer(device, UniformType.vec4, count);
  if (hasColor) storage.colors = makeAggregateBuffer(device, UniformType.vec4, count);
  if (hasSize) storage.sizes = makeAggregateBuffer(device, UniformType.float, count);
  if (hasDepth) storage.depth = makeAggregateBuffer(device, UniformType.float, count);

  return (items: LineAggregate[]) => {
    const count = items.reduce(allCount, 0);
    const props = {count, join: 'miter'};

    if (hasSegment) props.segments = updateAggregateBuffer(device, storage.segments, items, count, 'segment', 'segments');
    else props.segments = updateAggregateSegments(device, storage.segments, items, count);

    if (hasPosition) props.positions = updateAggregateBuffer(device, storage.positions, items, count, 'position', 'positions');
    if (hasColor) props.colors = updateAggregateBuffer(device, storage.colors, items, count, 'color', 'colors');
    if (hasSize) props.sizes = updateAggregateBuffer(device, storage.sizes, items, count, 'size', 'sizes');
    if (hasDepth) props.depth = updateAggregateBuffer(device, storage.depth, items, count, 'depth', 'depths');    

    return props;
  };
};

const makeRectangleAccumulator = (
  device: GPUDevice,
  items: LineAggregate[],
  keys: Set<string>,
  count: number,
) => {
  const storage = {} as Record<string, AggregateBuffer>;

  const hasRectangle = keys.has('rectangles') || keys.has('rectangle');
  const hasRadius = keys.has('radiuses') || keys.has('radius');
  const hasBorder = keys.has('borders') || keys.has('border');
  const hasStroke = keys.has('strokes') || keys.has('stroke');
  const hasFill = keys.has('fills') || keys.has('fill');
  const hasUV = keys.has('uvs') || keys.has('uv');
  const hasTexture = keys.has('textures') || keys.has('texture');

  if (hasRectangle) storage.rectangles = makeAggregateBuffer(device, UniformType.vec4, count);
  if (hasRadius) storage.radiuses = makeAggregateBuffer(device, UniformType.vec4, count);
  if (hasBorder) storage.borders = makeAggregateBuffer(device, UniformType.vec4, count);
  if (hasStroke) storage.strokes = makeAggregateBuffer(device, UniformType.vec4, count);
  if (hasFill) storage.fills = makeAggregateBuffer(device, UniformType.vec4, count);
  if (hasUV) storage.uvs = makeAggregateBuffer(device, UniformType.vec4, count);
  if (hasTexture) storage.textures = makeAggregateBuffer(device, UniformType.vec4, count);

  return (items: LineAggregate[]) => {
    const count = items.reduce(allCount, 0);
    const props = {count};

    if (hasRectangle) props.rectangles = updateAggregateBuffer(device, storage.rectangles, items, count, 'rectangle', 'rectangles');
    if (hasRadius) props.radiuses = updateAggregateBuffer(device, storage.radiuses, items, count, 'radius', 'radiuses');
    if (hasBorder) props.borders = updateAggregateBuffer(device, storage.borders, items, count, 'border', 'borders');
    if (hasStroke) props.strokes = updateAggregateBuffer(device, storage.strokes, items, count, 'stroke', 'strokes');
    if (hasFill) props.fills = updateAggregateBuffer(device, storage.fills, items, count, 'fill', 'fills');
    if (hasUV) props.uvs = updateAggregateBuffer(device, storage.uvs, items, count, 'uv', 'uvs');

    if (hasTexture) props.colors = updateAggregateBuffer(device, storage.colors, items, count, 'texture', 'textures');

    return props;
  };
};

const makeAggregateBuffer = (device: GPUDevice, format: UniformType, length: number) => {
  const {array, dims} = makeDataArray(format, length);
  if (dims === 3) throw new Error("Dims must be 1, 2, or 4");

  const buffer = makeStorageBuffer(device, array.byteLength);
  const source = {
    buffer,
    format,
    length,
    version: 0,
  };

  return {buffer, array, source, dims};
}

const updateAggregateBuffer = (
  device: GPUDevice,
  aggregate: AggregateBuffer,
  items: LayerAggregate[],
  count: number,
  key: string,
  keys: string,
) => {
  const {buffer, array, source, dims} = aggregate;

  let pos = 0;
  for (const item of items) {
    const {count, [key]: single, [keys]: multiple, isLoop} = item;

    if (multiple) copyNumberArrayCompositeRange(multiple, array, 0, pos, dims, count, isLoop);
    else if (single) copyNumberArrayRepeatedRange(single, array, 0, pos, dims, count, isLoop);

    const n = count + (isLoop ? 3 : 0);
    pos += n * dims;
  }

  uploadBuffer(device, buffer, array.buffer);
  source.length = count;

  return source;
}

const updateAggregateSegments = (
  device: GPUDevice,
  aggregate: AggregateBuffer,
  items: LayerAggregate[],
  count: number,
) => {
  const {buffer, array, source, dims} = aggregate;

  const chunks = [] as number[];
  const loops = [] as boolean[];

  for (const item of items) {
    const {count, isLoop} = item;
    chunks.push(count);
    loops.push(!!isLoop);
  }

  copyChunksToSegments(array, chunks, loops);
  uploadBuffer(device, buffer, array.buffer);
  source.length = count;

  return source;
}

const AGGREGATORS = {
  [LayerType.Line]: [makeLineAccumulator, Lines],
  [LayerType.Point]: [makePointAccumulator, Points],
  [LayerType.Rectangle]: [makeRectangleAccumulator, Rectangles],
};
