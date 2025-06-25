import type { LiveComponent } from '@use-gpu/live';
import { memo, use, useOne } from '@use-gpu/live';

import { useFaceSegmentsSource } from '../layers/face-segments';
import { FaceLayer } from '../layers/face-layer';

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

const COLORS = new Float32Array([
  1, 0.2, 0.2, 1,
  1, 0.2, 0.2, 1,
  1, 0.2, 0.2, 1,
  1, 0.2, 0.2, 1,
  0.2, 1, 0.2, 1,
  0.2, 1, 0.2, 1,
  0.2, 1, 0.2, 1,
  0.2, 1, 0.2, 1,
  0.2, 0.2, 1, 1,
  0.2, 0.2, 1, 1,
  0.2, 0.2, 1, 1,
  0.2, 0.2, 1, 1,
]);

const PLANES = new Uint8Array([
  1, 1,
  1, 1,
  1, 1,
  1, 1,
  2, 2,
  2, 2,
  2, 2,
  2, 2,
  3, 3,
  3, 3,
  3, 3,
  3, 3,
]);

const CHUNKS = [4, 4, 4];

/** Draws XY/YZ/ZX plane helper gizmo. */
export const PlaneHelper: LiveComponent<PlaneHelperProps> = memo((props: PlaneHelperProps) => {
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
    size, size,    0, 1,
       0, size,    0, 1,

       0,    0,    0, 1,
       0, size,    0, 1,
       0, size, size, 1,
       0,    0, size, 1,

       0,    0,    0, 1,
       0,    0, size, 1,
    size,    0, size, 1,
    size,    0,    0, 1,
  ]), size);

  const rgba = useOne(() => new Float32Array([
    1, 0.2, 0.2, opacity,
    1, 0.2, 0.2, opacity,
    1, 0.2, 0.2, opacity,
    1, 0.2, 0.2, opacity,
    0.2, 1, 0.2, opacity,
    0.2, 1, 0.2, opacity,
    0.2, 1, 0.2, opacity,
    0.2, 1, 0.2, opacity,
    0.2, 0.2, 1, opacity,
    0.2, 0.2, 1, opacity,
    0.2, 0.2, 1, opacity,
    0.2, 0.2, 1, opacity,
  ]), opacity);

  const positions = useRawSource(vertices, 'vec4<f32>');
  const colors    = useRawSource(rgba, 'vec4<f32>');
  const lookups   = useRawSource(PLANES, 'u8');

  const {segments, anchors, trims} = useFaceSegmentsSource(CHUNKS);

  return use(FaceLayer, {positions, colors, lookups, width, depth, segments, anchors, trims, side: 'both', ...rest});
}, 'PlaneHelper');
