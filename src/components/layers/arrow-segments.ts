import { LiveComponent, LiveElement } from '@use-gpu/live/types';
import { memo, yeet, useMemo } from '@use-gpu/live';

import { getChunkCount, generateChunkSegments, generateChunkAnchors } from '@use-gpu/core';
import { useBoundStorage } from '../hooks/useBoundStorage';

type ArrowSegmentsProps = {
  chunks: number[],
  loops?: boolean[],
  starts?: boolean[],
  ends?: boolean[],

  render?: (segments: ShaderSource, anchors: ShaderSource, trim: ShaderSource) => LiveElement<any>,
};

export const ArrowSegments: LiveComponent<ArrowSegmentsProps> = memo((
  props: ArrowSegmentsProps,
) => {
  const {chunks, loops, starts, ends, render} = props;

  const {segments, anchors, trims} = useArrowSegments(chunks, loops, starts, ends);

  return render ? render(segments, anchors, trims) : yeet([segments, anchors, trims]);
}, 'ArrowSegments');

export const useArrowSegments = (
  chunks: number[],
  loops?: boolean[],
  starts?: boolean[],
  ends?: boolean[],
) => {
  const count = getChunkCount(chunks, loops);

  // Make index data for line segments/anchor/trim data
  const [segmentBuffer, anchorBuffer, trimBuffer] = useMemo(() => {
    const segmentBuffer = new Int32Array(count);
    const anchorBuffer = new Uint32Array(count * 4);
    const trimBuffer = new Uint32Array(count * 4);

    generateChunkSegments(segmentBuffer, chunks, loops, starts, ends);
    generateChunkAnchors(anchorBuffer, trimBuffer, chunks, loops, starts, ends);

    return [segmentBuffer, anchorBuffer, trimBuffer];
  }, [chunks, loops, starts, ends, count]);

  // Bind as shader storage
  const segments = useBoundStorage(segmentBuffer, 'i32');
  const anchors = useBoundStorage(anchorBuffer, 'vec4<u32>');
  const trims = useBoundStorage(trimBuffer, 'vec4<u32>');
  
  return {segments, anchors, trims};
}
