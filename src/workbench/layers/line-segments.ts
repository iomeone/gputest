import type { TypedArray, VectorLike } from '@use-gpu/core';

import { useMemo } from '@use-gpu/live';
import { accumulateChunks, generateChunkSegments, alignSizeTo } from '@use-gpu/core';
import { useRawSource } from '../hooks/useRawSource';
import { LINE_SEGMENTS_SCHEMA } from './schemas';

export type LineSegmentsData = {
  count: number,
  segments: TypedArray,
  slices: TypedArray,
  unwelds: TypedArray,
};

/** Make index data for line segments data */
export const getLineSegments = ({
  chunks, groups, loops,
}: {
  chunks: VectorLike,
  groups?: VectorLike | null,
  loops?: boolean[] | boolean | null,
}) => {
  const count = accumulateChunks(chunks, loops);

  const segments = new Int8Array(alignSizeTo(count, 4));
  const slices = new Uint32Array(groups?.length ?? chunks.length);
  const unwelds = loops ? new Uint32Array(count) : undefined;

  generateChunkSegments(segments, slices, unwelds, chunks, groups, loops);

  return {count, segments, slices, unwelds, schema: LINE_SEGMENTS_SCHEMA};
};

export const useLineSegmentsSource = ({
  chunks, groups, loops,
}: {
  chunks: VectorLike,
  groups?: VectorLike | null,
  loops?: boolean[] | boolean | null,
}) => {
  const {count, segments, slices} = useMemo(
    () =>getLineSegments({chunks, groups, loops}),
    [chunks, groups, loops]
  );

  // Bind as shader storage
  const s = useRawSource(segments, 'i8');
  const l = useRawSource(slices, 'u32');

  return {count, segments: s, slices: l};
};
