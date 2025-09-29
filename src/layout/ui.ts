import type { LC, LiveFunction, LiveElement } from '@use-gpu/live';
import type { AggregateBuffer, Atlas, Rectangle, TextureSource, UniformType, TypedArray, StorageSource } from '@use-gpu/core';
import type { UIAggregate } from './types';

import {
  DeviceContext, DebugContext,
  SDFFontProvider, 
  useBufferedSize,
  UIRectangles,
} from '@use-gpu/workbench';
import { use, keyed, wrap, fragment, signal, yeet, gather, useCallback, useContext, useOne, useMemo } from '@use-gpu/live';
import { hashBits53, getObjectKey } from '@use-gpu/state';
import { getBundleKey } from '@use-gpu/shader';
import {
  makeAggregateBuffer,
  updateAggregateBuffer,
} from '@use-gpu/core';
import { overlapBounds, joinBounds } from './lib/util';

export type UIProps = {
  children: LiveElement,
};

export type UILayersProps = {
  items: (UIAggregate | null)[],        
};

const allCount = (a: number, b: UIAggregate): number => a + b.count + ((b as any).isLoop ? 3 : 0);

const allKeys = (a: Set<string>, b: UIAggregate): Set<string> => {
  let k: keyof UIAggregate;
  for (k in b) if (b[k] != null) a.add(k);
  return a;
}

const getItemSummary = (items: UIAggregate[]) => {
  const keys = items.reduce(allKeys, new Set());
  const count = items.reduce(allCount, 0);
  const memoKey = Array.from(keys).join('/');
  if (typeof count === 'string') debugger;

  return {keys, count, memoKey};
}

export const UI: LC<UIProps> = (props) => {
  const {children} = props;

  return (
    gather(
      wrap(SDFFontProvider, children),
      (items: (UIAggregate | null)[]) => {
        if (!Array.isArray(items)) items = [items];
        return UILayers({items});
      },
    )
  );
};

export const UILayers: LC<UILayersProps> = ({
  items,
}: UILayersProps) => {
  if (items.length === 0) return null;

  const partitioner = makePartitioner();
  for (let item of items) if (item) {
    partitioner.push(item);
  }
  const layers = partitioner.resolve();

  const els = layers.flatMap((layer, i): LiveElement => {
    if ((layer[0] as any)?.f) return (layer as any);
    return keyed(Layer, layer[0]?.id, layer);
  });
  els.push(signal());

  return fragment(els);
};

const Layer: LiveFunction<any> = (
  items: UIAggregate[],
) => {
  const device = useContext(DeviceContext);
  const {keys, count, memoKey} = getItemSummary(items);

  const {sdf2d: {contours}} = useContext(DebugContext);

  const size = useBufferedSize(count);
  const render = useMemo(() =>
    makeUIAccumulator(device, items, keys, size, contours),
    [memoKey, size, contours]
  );

  return render(items);
};

const makeUIAccumulator = (
  device: GPUDevice,
  items: UIAggregate[],
  keys: Set<string>,
  count: number,
  debugContours?: boolean,
) => {
  const storage = {} as Record<string, AggregateBuffer>;

  const hasRectangle = keys.has('rectangles') || keys.has('rectangle');
  const hasRadius = keys.has('radiuses') || keys.has('radius');
  const hasBorder = keys.has('borders') || keys.has('border');
  const hasStroke = keys.has('strokes') || keys.has('stroke');
  const hasFill = keys.has('fills') || keys.has('fill');
  const hasUV = keys.has('uvs') || keys.has('uv');
  const hasST = keys.has('sts') || keys.has('st');
  const hasRepeat = keys.has('repeats') || keys.has('repeat');
  const hasSDF = keys.has('sdfs') || keys.has('sdf');

  const hasTexture = keys.has('texture');
  const hasTransform = keys.has('transform');
  const hasClip = keys.has('clip');
  const hasMask = keys.has('mask');

  if (hasRectangle) storage.rectangles = makeAggregateBuffer(device, 'vec4<f32>', count);
  if (hasRadius) storage.radiuses = makeAggregateBuffer(device, 'vec4<f32>', count);
  if (hasBorder) storage.borders = makeAggregateBuffer(device, 'vec4<f32>', count);
  if (hasStroke) storage.strokes = makeAggregateBuffer(device, 'vec4<f32>', count);
  if (hasFill) storage.fills = makeAggregateBuffer(device, 'vec4<f32>', count);
  if (hasUV) storage.uvs = makeAggregateBuffer(device, 'vec4<f32>', count);
  if (hasST) storage.sts = makeAggregateBuffer(device, 'vec4<f32>', count);
  if (hasRepeat) storage.repeats = makeAggregateBuffer(device, 'i8', count);
  if (hasSDF) storage.sdfs = makeAggregateBuffer(device, 'vec4<f32>', count);

  return (items: UIAggregate[]) => {
    const count = items.reduce(allCount, 0);
    if (!count) return null;

    const props = {count, debugContours} as Record<string, any>;

    if (hasRectangle) props.rectangles = updateAggregateBuffer(device, storage.rectangles, items, count, 'rectangle', 'rectangles');
    if (hasRadius) props.radiuses = updateAggregateBuffer(device, storage.radiuses, items, count, 'radius', 'radiuses');
    if (hasBorder) props.borders = updateAggregateBuffer(device, storage.borders, items, count, 'border', 'borders');
    if (hasStroke) props.strokes = updateAggregateBuffer(device, storage.strokes, items, count, 'stroke', 'strokes');
    if (hasFill) props.fills = updateAggregateBuffer(device, storage.fills, items, count, 'fill', 'fills');
    if (hasUV) props.uvs = updateAggregateBuffer(device, storage.uvs, items, count, 'uv', 'uvs');
    if (hasST) props.sts = updateAggregateBuffer(device, storage.sts, items, count, 'st', 'sts');
    if (hasRepeat) props.repeats = updateAggregateBuffer(device, storage.repeats, items, count, 'repeat', 'repeats');
    if (hasSDF) props.sdfs = updateAggregateBuffer(device, storage.sdfs, items, count, 'sdf', 'sdfs');

    if (hasTexture) props.texture = items[0].texture;
    if (hasTransform) props.transform = items[0].transform;
    if (hasClip) props.clip = items[0].clip;
    if (hasMask) props.mask = items[0].mask;

    return use(UIRectangles, props);
  };
};

const getItemTypeKey = (item: UIAggregate) =>
  (item as any).f ? -1 : (
    hashBits53(getObjectKey(item.texture)) ^
    (item.transform ? getBundleKey(item.transform) : 0) ^
    (item.clip ? getBundleKey(item.clip) : 0) ^
    (item.mask ? getBundleKey(item.mask) : 0) ^

    (item.archetype != null ? item.archetype : (
      (+(item.rectangle != null || item.rectangles != null))    |
      (+(item.radius != null    || item.radiuses != null) << 1) |
      (+(item.border != null    || item.borders != null) << 2)  |
      (+(item.stroke != null    || item.strokes != null) << 3)  |
      (+(item.fill != null      || item.fills != null) << 4)    |
      (+(item.uv != null        || item.uvs != null) << 5)      |
      (+(item.st != null        || item.sts != null) << 6)      |
      (+(item.repeat != null    || item.repeats != null) << 7)  |
      (+(item.sdf != null       || item.sdfs != null) << 8)
    ))
  );

type Partition = {
  key: number,
  items: UIAggregate[],
  bounds: Rectangle,
};

const makePartitioner = () => {  
  const layers: Partition[] = [];
  const last = new Map<number, number>();

  const push = (item: UIAggregate) => {
    const key = getItemTypeKey(item);
    const {bounds} = item;

    const i = last.get(key)!;
    const n = layers.length;
    const layer = layers[i];

    if (i != null) {
      let blocked = !bounds;
      if (bounds) {
        for (let j = i + 1; j < n; ++j) {
          if (overlapBounds(layers[j].bounds, bounds)) {
            blocked = true;
            break;
          }
        }
      }
      if (!blocked || i === n - 1) {
        layer.items.push(item);
        if (bounds) layer.bounds = joinBounds(layer.bounds, bounds);
        return;
      }
    }

    const partition = {key, items: [item], bounds: bounds ?? [0, 0, 0, 0]};
    last.set(key, layers.length);
    layers.push(partition);
  };

  const resolve = () => layers.map(l => l.items);
  return {push, resolve};
}
