import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { ArrowFunction, FromSchema, TypedArray, StorageSource, LambdaSource, DataSchema, DataField, DataBounds, VectorLike, UniformType } from '@use-gpu/core';

import { useAnimationFrame, useNoAnimationFrame } from '../providers/loop-provider';
import { QueueReconciler } from '../reconcilers/index';
import { useAggregator } from '../hooks/useAggregator';
import { useBufferedSize } from '../hooks/useBufferedSize';
import { useRenderProp } from '../hooks/useRenderProp';
import { useOne, useMemo } from '@use-gpu/live';
import {
  toCPUDims,
  isUniformArrayType,
  getUniformDims,

  copyRecursiveNumberArray,
  offsetNumberArray,
  getBoundingBox,
  toDataBounds,

  normalizeSchema,
  allocateSchema,
  schemaToEmitters,
} from '@use-gpu/core';
import { sizeToChunkCounts, toChunkCounts, toVertexCount } from '@use-gpu/parse';

const {signal} = QueueReconciler;
const NO_TENSOR: number[] = [];

type BooleanList = boolean | boolean[] | ((i: number) => boolean);

export type SegmentsInfo = {
  positions: TypedArray,
  dims: number,
  chunks: number[] | TypedArray,
  groups: number[] | TypedArray | null,
  loops: boolean[] | boolean,
  starts: boolean[] | boolean,
  ends: boolean[] | boolean,
};

export type SegmentDecorator = (args: SegmentsInfo) => Record<string, any>;

export type DataProps<S extends DataSchema> = {
  /** WGSL schema of input data + accessors */
  schema: S,
  /** Input data, array of structs of values/arrays, or 1 struct, if data is not virtualized */
  data?: Record<string, any> | (Record<string, any>)[],
  /** Input data accessors, if data is virtualized */
  virtual?: Record<string, (i: number) => any>,
  /** Input length, if data is virtualized */
  count?: number,
  /** Input items to skip */
  skip?: number,
  /** Input version, if data is virtualized. Controls re-upload if set. */
  version?: number,
  /** Resample data on every animation frame. */
  live?: boolean,
  /** Data will never change */
  immutable?: boolean,

  /** Global flag or per item `isLoop` accessor */
  loop?: BooleanList,
  /** Global flag or per item `hasStart` accessor */
  start?: BooleanList,
  /** Global flag or per item `hasEnd` accessor */
  end?: BooleanList,

  /** Segment decorator(s) */
  segments?: SegmentDecorator,
  /** Segments from tensor dimensions */
  tensor?: number[],

  /** Receive 1 source per field, in virtual struct-of-array format. Leave empty to yeet sources instead. */
  render?: (sources: FromSchema<S, StorageSource | LambdaSource>) => LiveElement,
  children?: (sources: FromSchema<S, StorageSource | LambdaSource>) => LiveElement,
};

const NO_BOUNDS = {center: [], radius: 0, min: [], max: []} as DataBounds;

/** Aggregate array-of-structs with fields `T | T[] | T[][]` into grouped storage sources. */
export const Data: LiveComponent<DataProps<DataSchema>> = <S extends DataSchema>(props: DataProps<S>) => {
  const {
    skip = 0,
    count,
    version,
    data: propData,
    schema: propSchema,
    virtual,
    loop,
    start,
    end,
    segments,
    tensor,
    live = false,
    immutable = false,
  } = props;
  
  const schema = useOne(() => normalizeSchema(propSchema), propSchema);
  const data: Record<string, any>[] | null = propData ? Array.isArray(propData) ? propData : [propData] : null;
  const itemCount = Math.max(0, count ?? ((data?.length || 0) - skip));

  if (itemCount === 0) return null;

  const keys = useMemo(
    () => Object.keys(schema).filter(k => virtual?.[k] ?? data?.[0][schema[k].prop ?? k] != null),
    [schema, propData, virtual]
  );

  if (keys.length === 0) return null;

  // Identify an array and index field (if any)
  const [countKey, indexedKey, isArray, isIndexed] = useMemo(() => {
    const countKey = keys.find(k => isUniformArrayType(schema[k].format as any));
    const indexedKey = keys.find(k => schema[k].index);

    const isArray = !!countKey;
    const isIndexed = !!indexedKey;

    return [countKey ?? keys[0], indexedKey, isArray, isIndexed];
  }, [schema, ...keys]);

  // Resolve segment flags
  const [loops, starts, ends] = useMemo(() => {
    const loops  = resolveSegmentFlag(itemCount, loop, skip);
    const starts = resolveSegmentFlag(itemCount, start, skip);
    const ends   = resolveSegmentFlag(itemCount, end, skip);

    return [loops, starts, ends];
  }, [itemCount, loop, start, end, skip]);

  // Resolve chunk/group counts
  const [chunks, groups, vertexCount, indexCount] = useMemo(() => {
    let chunks = null;
    let groups = null;
    let vertexCount = itemCount
    let indexCount = itemCount;

    if (isArray) {
      if (tensor) {
        [chunks, groups] = sizeToChunkCounts(tensor);
        indexCount = vertexCount = tensor.reduce((a, b) => a * b, 1);
      }
      else if (segments) {
        [vertexCount, chunks, groups] = getMultiChunkCount(schema, countKey, itemCount, data, virtual, skip);
        if (indexedKey) [indexCount, chunks, groups] = getMultiChunkCount(schema, indexedKey, itemCount, data, virtual, skip);
      }
      else {
        vertexCount = getVertexCount(schema, countKey, itemCount, data, virtual, skip);
        if (indexedKey) indexCount = getVertexCount(schema, indexedKey, itemCount, data, virtual, skip);
      }
    }

    return [chunks, groups, vertexCount, indexedKey ? indexCount : vertexCount];
  }, [isArray, segments, itemCount, countKey, indexedKey, data, virtual, skip, ...(tensor ?? NO_TENSOR)]);

  const allocItems = useBufferedSize(itemCount);
  const allocVertices = useBufferedSize(vertexCount);
  const allocIndices = useBufferedSize(indexCount);

  // Make arrays for merged attributes
  const hasSegments = !!segments || !!tensor || keys.includes('segments');
  const {fields, attributes, archetype} = useMemo(
    () => allocateSchema(
      schema,
      allocItems,
      allocVertices,
      allocIndices,
      hasSegments,
      (key: string) => keys.includes(key),
    ),
    [schema, keys, allocItems, allocVertices, allocIndices, hasSegments]
  );

  // Blit all data into merged arrays if stale
  const slices = useMemo(() => {
    const offsets: number[] = [0];
    const slices = [];
    const sliceKey = indexedKey ?? countKey;

    // Get index offsets for chunks
    if (isIndexed) {
      const {dims, prop = countKey} = fields[countKey];
      const dimsIn = toCPUDims(dims);

      let last = 0;

      const accessor = virtual?.[countKey];
      if (accessor || data) {
        for (let i = 0; i < itemCount; ++i) {
          const from = accessor ? accessor(i + skip) : data ? data[i + skip][prop] : 0;
          const length = from.length / dimsIn;
          last += length;
          offsets.push(last);
        }
      }
    }

    // Blit data
    for (const k in fields) {
      const accessor = virtual?.[k];
      if (!accessor && !data) continue;

      const {array, dims, depth, prop = k} = fields[k];
      const slice = k === sliceKey;
      const indexed = schema[k].index;

      // Keep CPU-only layout, as useAggregator will widen for us
      const dimsIn = toCPUDims(dims);

      let base = 0;
      let offset = 0;
 
      for (let i = 0; i < itemCount; ++i) {
        const from = accessor ? accessor(i + skip) : data ? data[i + skip][prop] : 0;
        offset += copyRecursiveNumberArray(from, array, dimsIn, dimsIn, depth, offset, 1);

        if (indexed) offsetNumberArray(array, array, offsets[i] || 0, dimsIn, dimsIn, base, base, offset - base);
        if (slice) slices.push((offset - base) / dimsIn + ((loops === true || (loops as boolean[])?.[i]) ? 3 : 0));
        base = offset;
      }
    }

    return slices;
  }, [
    fields,
    live ? NaN : virtual ? (version ?? NaN) : null, propData,
    itemCount, skip,
    countKey, indexedKey,
  ]);

  // Get emitters for data + segment data
  const [mergedSchema, emitters, total, indexed] = useMemo(() => {
    if (!isArray || !segments) return [schema, schemaToEmitters(schema, attributes), vertexCount, indexCount, 0];

    const {array, dims} = fields[countKey];

    const segmentData = segments({
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        chunks: chunks!,
        groups: groups,
        positions: array,
        dims: toCPUDims(dims),
        loops,
        starts,
        ends,
    });

    const {count: total, indexed, schema: segmentSchema, ...rest} = segmentData;
    for (const k in rest) if (attributes[k]) throw new Error(`Attribute name '${k}' reserved for segment data.`);

    const mergedSchema = {...schema, ...segmentSchema};
    const emitters = schemaToEmitters(mergedSchema, {...attributes, ...rest});

    return [mergedSchema, emitters, total, indexed];
  }, [schema, fields, countKey, attributes, segments, chunks, groups, loops, starts, ends]);

  // Make aggregate chunk
  const items = useMemo(() => [{
    count: total,
    indexed,
    instanced: itemCount,
    slices,
    archetype,
    attributes: emitters,
  }], [total, indexed, itemCount, slices, archetype, emitters]);

  // Aggregate into struct buffers by access policy
  const {sources} = useAggregator(mergedSchema, items);

  useMemo(() => {
    // Tag output with tensor size
    if (tensor) for (const k in sources) (sources as any)[k].size = tensor;

    // Tag positions with bounds
    if (!fields.positions) return NO_BOUNDS;

    const {array, dims} = fields.positions;
    const bounds = toDataBounds(getBoundingBox(array, toCPUDims(dims)));

    if ('positions' in sources && bounds != null) (sources.positions as any).bounds = bounds;
  }, [fields, items, sources, ...(tensor ?? NO_TENSOR)]);

  if (live) useAnimationFrame();
  else useNoAnimationFrame();

  const trigger = useOne(() => signal(), immutable ? null : items);

  const view = useRenderProp(props, sources as any);
  return immutable ? view : [trigger, view];
};

// Resolve loop/start/end flags into array
const resolveSegmentFlag = (
  count: number,
  flag?: BooleanList,
  skip: number = 0
): boolean | boolean[] => {
  if (typeof flag === 'function') {
    const flags = [];
    for (let i = 0; i < count; ++i) flags.push((flag as ArrowFunction)(i + skip));
    return flags;
  }
  if (Array.isArray(flag)) {
    if (skip) return flag.slice(skip, skip + count);
    else if (flag.length > count) return flag.slice(0, count);
    return flag;
  }
  return !!flag;
};

// Get list of inner ragged chunk lengths plus outer ragged groupings
const getMultiChunkCount = (
  schema: Record<string, DataField>,
  key: string,
  itemCount: number,
  data?: Record<string, any>[] | null,
  virtual?: Record<string, (i: number) => any>,
  skip: number = 0
): [number, VectorLike, VectorLike | null] => {
  const {format, prop = key} = schema[key];
  const accessor = virtual?.[key];

  const f = format as UniformType;
  const dims = getUniformDims(f);

  const get = (accessor
    ? (i: number) => accessor(i)
    : data ? (i: number) => data[i][prop] : () => 0
  );

  const chunks = [];
  const groups = [];

  for (let i = 0; i < itemCount; ++i) {
    const [c, g] = toChunkCounts(get(i + skip), dims);
    chunks.push(...c);
    if (g) groups.push(...g)
    else groups.push(c.length);
  }

  const count = chunks.reduce((a, b) => a + b, 0);
  return [count, chunks, groups];
};

// Get total vertex count
const getVertexCount = (
  schema: Record<string, DataField>,
  key: string,
  itemCount: number,
  data?: Record<string, any>[] | null,
  virtual?: Record<string, (i: number) => any>,
  skip: number = 0
) => {
  const {format, prop} = schema[key];
  const accessor = virtual?.[key];

  const f = format as UniformType;
  const dims = toCPUDims(getUniformDims(f));

  const get = (accessor
    ? (i: number) => accessor(i)
    : data ? (i: number) => data[i][prop ?? key] : () => 0
  );

  let total = 0;
  for (let i = 0; i < itemCount; ++i) total += toVertexCount(get(i + skip), dims);
  return total;
};
