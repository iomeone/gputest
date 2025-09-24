import { UniformAttribute, UniformType } from './types';

export const PICKING_UNIFORMS: UniformAttribute[] = [
  {
    name: 'pickingId',
    format: UniformType.i32,
  },
];

export const makeIdAllocator = <T>() => {
  const used = new Map<number, T | undefined>();

  let i = 1;
  return {
    get: (i: number): T | undefined => used.get(i),
    obtain: (t?: T) => {
      while (used.has(i)) i++;
      used.set(i, t);
      return i;
    },
    release: (j: number) => {
      used.delete(j);
      i = Math.min(i, j);
    },
  };
};
