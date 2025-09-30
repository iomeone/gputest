import type { CPUGeometry } from '@use-gpu/core';
import { makeNumberWriter } from '@use-gpu/core';

type AABBGeometryProps = {
  min?: [number, number] | [number, number, number],
  max?: [number, number] | [number, number, number],
};

const lerp = (a: number, b: number, t: number) => a * (1 - t) + b * t;

export const makeAABBGeometry = ({
  min = [-1, -1, -1],
  max = [1, 1, 1],
}: AABBGeometryProps = {}): CPUGeometry => {
  const count = 7 * 6;

  const positions = new Float32Array(count * 4);
  const segments = new Uint8Array(count);

  const {emit: positionEmitter} = makeNumberWriter(positions, 4);
  const {emit: segmentEmitter} = makeNumberWriter(segments, 1);

  const emitPosition = (x: number, y: number, z: number) =>
    positionEmitter(
      lerp(min[0] || 0, max[0] || 0, x),
      lerp(min[1] || 0, max[1] || 0, y),
      lerp(min[2] || 0, max[2] || 0, z),
      1,
    );

  const emitSegment = (s: number) =>
    segmentEmitter(s);

  emitPosition(1, 0, 0);
  emitPosition(1, 1, 0);
  emitPosition(0, 1, 0);
  emitPosition(0, 0, 0);
  emitPosition(1, 0, 0);
  emitPosition(1, 1, 0);
  emitPosition(0, 1, 0);

  emitSegment(0);
  emitSegment(3);
  emitSegment(3);
  emitSegment(3);
  emitSegment(3);
  emitSegment(0);
  emitSegment(0);

  emitPosition(1, 0, 1);
  emitPosition(1, 1, 1);
  emitPosition(0, 1, 1);
  emitPosition(0, 0, 1);
  emitPosition(1, 0, 1);
  emitPosition(1, 1, 1);
  emitPosition(0, 1, 1);

  emitSegment(0);
  emitSegment(3);
  emitSegment(3);
  emitSegment(3);
  emitSegment(3);
  emitSegment(0);
  emitSegment(0);


  emitPosition(0, 1, 0);
  emitPosition(0, 1, 1);
  emitPosition(0, 0, 1);
  emitPosition(0, 0, 0);
  emitPosition(0, 1, 0);
  emitPosition(0, 1, 1);
  emitPosition(0, 0, 1);

  emitSegment(0);
  emitSegment(3);
  emitSegment(3);
  emitSegment(3);
  emitSegment(3);
  emitSegment(0);
  emitSegment(0);

  emitPosition(1, 1, 0);
  emitPosition(1, 1, 1);
  emitPosition(1, 0, 1);
  emitPosition(1, 0, 0);
  emitPosition(1, 1, 0);
  emitPosition(1, 1, 1);
  emitPosition(1, 0, 1);

  emitSegment(0);
  emitSegment(3);
  emitSegment(3);
  emitSegment(3);
  emitSegment(3);
  emitSegment(0);
  emitSegment(0);


  emitPosition(1, 0, 0);
  emitPosition(1, 0, 1);
  emitPosition(0, 0, 1);
  emitPosition(0, 0, 0);
  emitPosition(1, 0, 0);
  emitPosition(1, 0, 1);
  emitPosition(0, 0, 1);

  emitSegment(0);
  emitSegment(3);
  emitSegment(3);
  emitSegment(3);
  emitSegment(3);
  emitSegment(0);
  emitSegment(0);

  emitPosition(1, 1, 0);
  emitPosition(1, 1, 1);
  emitPosition(0, 1, 1);
  emitPosition(0, 1, 0);
  emitPosition(1, 1, 0);
  emitPosition(1, 1, 1);
  emitPosition(0, 1, 1);

  emitSegment(0);
  emitSegment(3);
  emitSegment(3);
  emitSegment(3);
  emitSegment(3);
  emitSegment(0);
  emitSegment(0);


  return {
    count,
    attributes: {positions, segments},
    formats: {positions: 'vec4<f32>', segments: 'i8'},
  };
}
