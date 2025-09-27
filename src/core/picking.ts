import type { UniformAttribute, UniformType } from './types';

export const PICKING_UNIFORMS: UniformAttribute[] = [
  {
    name: 'pickingId',
    format: 'i32',
  },
];

export const makeIdAllocator = () => {
  const used = new Set<number>();

  let i = 1;
  return {
    obtain: () => {
      while (used.has(i)) i++;
      used.add(i);
      return i;
    },
    release: (j: number) => {
      used.delete(j);
      i = Math.min(i, j);
    },
  };
};
