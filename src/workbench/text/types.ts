import type { TypedArray } from '@use-gpu/core';

export type Alignment = 'start' | 'center' | 'end' | 'justify' | 'justify-start' | 'justify-center' | 'justify-end' | 'between' | 'evenly';

export type SDFGlyphData = {
  id: number,
  indices: TypedArray,
  layouts: TypedArray,
  rectangles: TypedArray,
  uvs: TypedArray,
  sdf: [number, number, number, number],
};


