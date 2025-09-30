import type { TypedArray, VectorLike } from '@use-gpu/core';

import { useMemo } from '@use-gpu/live';
import { accumulateChunks, generateChunkSegments, generateChunkAnchors, alignSizeTo } from '@use-gpu/core';
import { useRawSource } from '../hooks/useRawSource';
import { ARROW_SEGMENTS_SCHEMA } from './schemas';

export type ArrowSegmentsData = {
  count: number,
  sparse: number,
  segments: TypedArray,
  anchors: TypedArray,
  trims: TypedArray,
  slices: TypedArray,
  unwelds: TypedArray,
};

/** Make index data for arrow segments/anchor/trim data */
export const getArrowSegments = ({
  chunks, groups, loops, starts, ends,
}: {
  chunks: VectorLike,
  groups?: VectorLike | null,
  loops?: boolean[] | boolean | null,
  starts?: boolean[] | boolean | null,
  ends?: boolean[] | boolean | null,
}) => {
  const count = accumulateChunks(chunks, loops);

  const segments = new Int8Array(alignSizeTo(count, 4));
  const slices = new Uint32Array(groups?.length ?? chunks.length);
  const unwelds = loops ? new Uint32Array(count, 2) : undefined;
  const anchors = new Uint32Array(count * 4);
  const trims = new Uint32Array(count * 4);

  generateChunkSegments(segments, slices, unwelds, chunks, groups, loops, starts, ends);
  const sparse = generateChunkAnchors(anchors, trims, chunks, loops, starts, ends);

  return {
    count,
    sparse,
    segments,
    anchors,
    trims,
    slices,
    unwelds,
    schema: ARROW_SEGMENTS_SCHEMA,
  };
}

export const useArrowSegmentsSource = (
  chunks: VectorLike,
  groups?: VectorLike | null,
  loops?: boolean[] | boolean | null,
  starts?: boolean[] | boolean | null,
  ends?: boolean[] | boolean | null,
) => {
  const {count, sparse, segments, anchors, trims, slices} = useMemo(
    () => getArrowSegments({chunks, groups, loops, starts, ends}),
    [chunks, groups, loops, starts, ends]
  );

  // Bind as shader storage
  const s = useRawSource(segments, 'i8');
  const a = useRawSource(anchors, 'vec4<u32>');
  const t = useRawSource(trims, 'vec4<u32>');

  a.length = sparse;
  a.size[0] = sparse;

  return {
    count,
    sparse,
    slices,
    segments: s,
    anchors: a,
    trims: t,
  };
}
