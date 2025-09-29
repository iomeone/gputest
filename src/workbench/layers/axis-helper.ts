import type { LiveComponent } from '@use-gpu/live';
import type { StorageSource } from '@use-gpu/core';
import { memo, use, useOne } from '@use-gpu/live';

import { ArrowSegments } from './arrow-segments';
import { ArrowLayer } from './arrow-layer';

import { useRawSource } from '../hooks/useRawSource';

export type AxisHelperProps = {
  width?: number,
  size?: number,
  depth?: number,
};

const COLORS = new Float32Array([
  1, 0.2, 0.2, 1,
  1, 0.2, 0.2, 1,
  0.2, 1, 0.2, 1,
  0.2, 1, 0.2, 1,
  0.2, 0.2, 1, 1,
  0.2, 0.2, 1, 1,
]);

const CHUNKS = [2, 2, 2];
const ENDS   = [true, true, true];

/** Draws XYZ axis helper gizmo. */
export const AxisHelper: LiveComponent<AxisHelperProps> = memo((props: AxisHelperProps) => {
  const {
    width = 1,
    size = 1,
    depth = 0,
  } = props;

  const vertices = useOne(() => new Float32Array([
       0,    0,    0, 1,
    size,    0,    0, 1,
       0,    0,    0, 1,
       0, size,    0, 1,
       0,    0,    0, 1,
       0,    0, size, 1,
  ]), size);

  const positions = useRawSource(vertices, 'vec4<f32>');
  const colors    = useRawSource(COLORS, 'vec4<f32>');

  return use(ArrowSegments, {
    chunks: CHUNKS,
    ends: ENDS,
    render: (segments: StorageSource, anchors: StorageSource, trims: StorageSource) => 
      use(ArrowLayer, {positions, colors, width, depth, segments, anchors, trims})
  });
}, 'AxisHelper');
