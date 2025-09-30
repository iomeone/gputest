import type { LiveComponent } from '@use-gpu/live';
import { memo, use, useOne } from '@use-gpu/live';

import { useArrowSegmentsSource } from '../layers/arrow-segments';
import { ArrowLayer } from '../layers/arrow-layer';

import { useRawSource } from '../hooks/useRawSource';

export type AxisHelperProps = {
  width?: number,
  size?: number,
  depth?: number,
  opacity?: number,

  id?: number,
  mode?: string,
  zBias?: number,
};


const AXES = new Uint8Array([
  1, 1,
  2, 2,
  3, 3,
  0, 0,
]);

const CHUNKS = [2, 2, 2];
const ENDS   = [true, true, true];

/** Draws XYZ axis helper gizmo. */
export const AxisHelper: LiveComponent<AxisHelperProps> = memo((props: AxisHelperProps) => {
  const {
    width = 1,
    size = 1,
    depth = 0,
    opacity = 1,

    ...rest
  } = props;

  const vertices = useOne(() => new Float32Array([
       0,    0,    0, 1,
    size,    0,    0, 1,
       0,    0,    0, 1,
       0, size,    0, 1,
       0,    0,    0, 1,
       0,    0, size, 1,
  ]), size);

  const rgba = useOne(() => new Float32Array([
    1, 0.2, 0.2, opacity,
    1, 0.2, 0.2, opacity,
    0.2, 1, 0.2, opacity,
    0.2, 1, 0.2, opacity,
    0.2, 0.2, 1, opacity,
    0.2, 0.2, 1, opacity,
  ]), opacity);

  const positions = useRawSource(vertices, 'vec4<f32>');
  const colors    = useRawSource(rgba, 'vec4<f32>');
  const lookups   = useRawSource(AXES, 'u8');

  const {segments, anchors, trims} = useArrowSegmentsSource(CHUNKS, null, null, null, ENDS);

  return use(ArrowLayer, {positions, colors, lookups, width, depth, segments, anchors, trims, ...rest});
}, 'AxisHelper');
