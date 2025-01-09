import { mat4 } from 'gl-matrix';

const VIEW_LABELS = ['Right (+X)', 'Left (-X)', 'Top (+Y)', 'Bottom (-Y)', 'Front (+Z)', 'Back (-Z)'];

const VIEW_MATRICES = [
  mat4.fromValues(
    0, 0,-1, 0,
    0, 1, 0, 0,
   -1, 0, 0, 0,
    0, 0, 0, 1,
  ),  // R
  mat4.fromValues(
    0, 0, 1, 0,
    0, 1, 0, 0,
    1, 0, 0, 0,
    0, 0, 0, 1,
  ),  // L
  mat4.fromValues(
    1, 0, 0, 0,
    0, 0,-1, 0,
    0,-1, 0, 0,
    0, 0, 0, 1,
  ),  // T
  mat4.fromValues(
    1, 0, 0, 0,
    0, 0, 1, 0,
    0, 1, 0, 0,
    0, 0, 0, 1,
  ),  // Bm
  mat4.fromValues(
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0,-1, 0,
    0, 0, 0, 1,
  ),  // F
  mat4.fromValues(
   -1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ),  // Bk
];

export const getCubeFaceLabel = (i: number) => VIEW_LABELS[i];

export const getCubeFaceMatrix = (i: number) => VIEW_MATRICES[i];
