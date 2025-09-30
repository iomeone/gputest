import type { CPUGeometry } from '@use-gpu/core';

export const makeArrowFlatGeometry = (
  width: number = 2.5
): CPUGeometry => {
  const positions = makeArrowFlatVertices(width);

  return {
    attributes: {positions},
    formats: {positions: 'vec4<f32>'},
    count: 3,
  };
}

const makeArrowFlatVertices = (width: number = 2.5) => {
  return new Float32Array([
        0,  0, 0, 1,
    width, 0, -1, 1,
    width, 0,  1, 1,
  ]);
};