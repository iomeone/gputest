import type { TypedArray, VectorLike } from '@use-gpu/core';

import { useMemo } from '@use-gpu/live';
import { accumulateChunks, generateChunkSegments, generateChunkArcs, alignSizeTo } from '@use-gpu/core';
import { useRawSource } from '../hooks/useRawSource';
import { ARC_SEGMENTS_SCHEMA, ARC_ANCHORS_SCHEMA } from './schemas';

export type ArcSegmentsData = {
  count: number,
  sparse: number,
  segments: TypedArray,
  trims: TypedArray,
  slices: TypedArray,
  unwelds: TypedArray,
};

/** Make index data for arc segments/trim data */
export const getArcSegments = ({
  chunks, groups, loops,
}: {
  chunks: VectorLike,
  groups?: VectorLike | null,
  loops?: boolean[] | boolean | null,
}) => {
  const count = accumulateChunks(chunks);

  const segments = new Int8Array(alignSizeTo(count, 4));
  const slices = new Uint32Array(groups?.length ?? chunks.length);
  const unwelds = loops ? new Uint32Array(count, 2) : undefined;
  const anchors = new Uint32Array(count * 2);
  const trims = new Uint32Array(count * 2);

  generateChunkSegments(segments, slices, unwelds, chunks, groups, loops);
  const sparse = generateChunkArcs(anchors, trims, chunks, loops);

  return {
    count,
    sparse,
    //segments, //unused
    anchors,
    trims,
    slices,
    unwelds,
    schema: {...ARC_SEGMENTS_SCHEMA, ...ARC_ANCHORS_SCHEMA},
  };
}

export const useArcSegmentsSource = (
  chunks: VectorLike,
  groups?: VectorLike | null,
  loops?: boolean[] | boolean | null,
) => {
  const {count, sparse, anchors, trims, slices} = useMemo(
    () => getArcSegments({chunks, groups, loops}),
    [chunks, groups, loops]
  );

  // Bind as shader storage
  const a = useRawSource(anchors, 'vec4<u32>');
  const t = useRawSource(trims, 'vec4<u32>');

  a.length = sparse || 0;
  a.size[0] = sparse || 0;

  return {
    count,
    sparse,
    slices,
    anchors: a,
    trims: t,
  };
}
