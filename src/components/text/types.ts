import { StorageSource } from '@use-gpu/core/types';

export type Font = {
  props: FontProps,
  data: Uint8Array,
};

export type FontProps = {
  family: string,
  weight: number,
  style: string,
};

export type FontSource = FontProps & {
  src: string,
};

export type SDFGlyphData = {
  id: number,
  indices: StorageSource,
  layouts: StorageSource,
  rectangles: StorageSource,
  uvs: StorageSource,
  sdf: [number, number],
};


