import type { LiveComponent, LiveElement } from '../../live';
import type { StorageSource } from '../../core';

import { memo, yeet, useMemo } from '../../live';
import { getChunkCount, generateChunkSegments, alignSizeTo } from '../../core';
import { useRawSource } from '../hooks/useRawSource';

export type LineSegmentsProps = {
  chunks?: number[],
  loops?: boolean[],

  render?: (segments: StorageSource, lookups: StorageSource) => LiveElement<any>,
};

/** Produces `segments` composite data for `@{LineLayer}`. */
export const LineSegments: LiveComponent<LineSegmentsProps> = memo((
  props: LineSegmentsProps,
) => {
  const {chunks, loops, render} = props;
  if (!chunks) return null;
  
  const count = getChunkCount(chunks, loops);

  // Make index data for line segments/anchor/trim data
  const [segmentBuffer, lookupBuffer] = useMemo(() => {
    const segmentBuffer = new Int8Array(alignSizeTo(count, 4));
    const lookupBuffer = new Uint32Array(count);

    generateChunkSegments(segmentBuffer, lookupBuffer, chunks, loops);

    return [segmentBuffer, lookupBuffer];
  }, [chunks, loops, count]);

  // Bind as shader storage
  const segments = useRawSource(segmentBuffer, 'i8');
  const lookups = useRawSource(lookupBuffer, 'u32');

  return render ? render(segments, lookups) : yeet([segments, lookups]);
}, 'LineSegments');
