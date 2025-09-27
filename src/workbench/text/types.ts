import type { TypedArray } from '@use-gpu/core';
import type { FontProps } from '@use-gpu/glyph';

export type Alignment = 'start' | 'center' | 'end' | 'justify' | 'justify-start' | 'justify-center' | 'justify-end' | 'between' | 'evenly';

export type FontSource = FontProps & {
  src: string,
};

export type SDFGlyphData = {
  id: number,
  indices: TypedArray,
  layouts: TypedArray,
  rectangles: TypedArray,
  uvs: TypedArray,
  sdf: [number, number, number, number],
};


