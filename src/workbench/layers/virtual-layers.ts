import type { LiveComponent, LiveFunction, LiveElement, DeferredCall } from '@use-gpu/live';
import type { ShaderSource } from '@use-gpu/shader';
import type { LayerAggregator, LayerAggregate, LayerAggregates } from './types';

import { use, keyed, yeet, provide, multiGather, unquote, useMemo, useOne } from '@use-gpu/live';
import { mixBits53, getObjectKey } from '@use-gpu/state';
import { getBundleKey } from '@use-gpu/shader';

import { TransformContext } from '../providers/transform-provider';
import { MaterialContext } from '../providers/material-provider';
import { ScissorContext } from '../providers/scissor-provider';
import { LayerReconciler, QueueReconciler } from '../reconcilers/index';

import { useAggregator } from '../hooks/useAggregator';

import { IndexedTransform } from './indexed-transform';
import { FaceLayer } from './face-layer';
import { LineLayer } from './line-layer';
import { PointLayer } from './point-layer';
import { ArrowLayer } from './arrow-layer';
import { LabelLayer } from './label-layer';

import { LINE_SCHEMA, POINT_SCHEMA, ARROW_SCHEMA, FACE_SCHEMA, LABEL_SCHEMA } from './schemas';

const DEBUG = false;

export type VirtualLayersProps = {
  items?: Record<string, LayerAggregate[]>,
  children?: LiveElement,
};

const AGGREGATORS = {
  'arrow': { schema: ARROW_SCHEMA, component: ArrowLayer },
  'face':  { schema: FACE_SCHEMA,  component: FaceLayer  },
  'line':  { schema: LINE_SCHEMA,  component: LineLayer  },
  'point': { schema: POINT_SCHEMA, component: PointLayer },
  'label': { schema: LABEL_SCHEMA, component: LabelLayer },
} as Record<string, LayerAggregator>;

const ORDER: Record<string, number> = {};
['face', 'line', 'arrow', 'point'].forEach((type, i) => ORDER[type] = i);

/** Aggregate (point / line / face) geometry from children to produce merged layers. */
export const VirtualLayers: LiveComponent<VirtualLayersProps> = (props: VirtualLayersProps) => {
  const {reconcile, quote} = LayerReconciler;

  const {items, children} = props;
  return items ? Resume(items) : children ? (
    reconcile(quote(multiGather(unquote(children), Resume)))
  ) : null;
};

const Resume = (
  aggregates: LayerAggregates,
) => useOne(() => {
  const {signal} = QueueReconciler;
  const els: LiveElement[] = [signal()];

  const types = Object.keys(aggregates);
  types.sort((a, b) => (ORDER[a] || 0) - (ORDER[b] || 0));

  const partitioner = makePartitioner();

  for (const type of types) {
    const items = (aggregates as any)[type];
    if (!items.length) continue;

    const layerAggregator = AGGREGATORS[type];
    if (!layerAggregator) continue;

    for (const item of items) if (item) {
      partitioner.push(item, type);
    }
  }

  const layers = partitioner.resolve();
  for (const {key, type, items} of layers) {
    const layerAggregator = AGGREGATORS[type];
    els.push(keyed(Aggregate, key, layerAggregator, items));
  }
  return els;
}, aggregates);

const Aggregate: LiveFunction<any> = (
  layerAggregator: LayerAggregator,
  items: LayerAggregate[],
) => {
  const [item] = items;
  const {flags, sources: extra} = item;
  const {schema, component} = layerAggregator;
  const {quote} = QueueReconciler;

  const {count, sources, uploadRefs} = useAggregator(item.schema ?? schema, items);

  return useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {matrices, normalMatrices, ...rest} = sources as Record<string, any>;
    const props = {count, ...rest, ...extra, ...flags};

    DEBUG && console.log(component.name, {props, items, sources});

    const element = use(component, props);
    const layer = provideContext(element, item, sources);

    const upload = useOne(() => uploadRefs ? quote(yeet(uploadRefs)) : null, uploadRefs);
    return upload ? [upload, layer] : layer;
    // Exclude flags and contexts because they are factored into the archetype
  }, [count, sources, extra, uploadRefs]);
};

const provideContext = (
  element: LiveElement,
  item: LayerAggregate,
  refSources?: Record<string, ShaderSource>,
) => {
  if (!element) return null;
  const {material, scissor, transform} = item;

  const hasRefTransform = !!refSources?.matrices;
  const hasTransform = !!transform?.key;
  const hasMaterial = !!material;
  const hasScissor = !!scissor;
  
  const key = (element as DeferredCall<any>)?.key;

  let view = element;
  if (hasRefTransform) {
    view = use(IndexedTransform, {...refSources, immediate: true, children: view});
  }
  if (hasTransform) {
    view = provide(TransformContext, transform, view, key);
  }
  if (hasMaterial) {
    view = provide(MaterialContext, material, view, key);
  }
  if (hasScissor) {
    view = provide(ScissorContext, scissor, view, key);
  }
  return view;
};

const getItemTypeKey = (item: LayerAggregate) =>
  ('material' in item && item.material
    ? getObjectKey(item.material)
    : 0) ^
  ('scissor' in item && item.scissor
    ? getBundleKey(item.scissor)
    : 0) ^
  ('transform' in item && item.transform
    ? (item.transform.key || 0)
    : 0) ^
  mixBits53(item.archetype, item.zIndex || 0);

type Partition = {
  key: number,
  type: string,
  items: LayerAggregate[],
  zIndex: number,
};

const makePartitioner = () => {
  const layers: Partition[] = [];
  const map = new Map<number, Partition>();

  const push = (item: LayerAggregate, type: string) => {
    const {zIndex = 0} = item;
    const key = getItemTypeKey(item);
    const existing = map.get(key);
    if (existing) {
      existing.items.push(item);
    }
    else {
      const partition = {key, type, zIndex, items: [item]};
      map.set(key, partition);
      layers.push(partition);
    }
  };

  const resolve = () => {
    layers.sort((a, b) => a.zIndex - b.zIndex);
    return layers;
  };

  return {push, resolve};
}
