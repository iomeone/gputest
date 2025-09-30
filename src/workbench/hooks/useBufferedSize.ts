import { useOne, useNoOne } from '@use-gpu/live';

// Return enough space to hold at least `size` items while resizing exponentially.
export const useBufferedSize = (size: number, min: number = 0) => {
  const ref = useOne(() => ({alloc: Math.max(size, min)}));
  return ref.alloc = adjustSize(size, ref.alloc);
};

export const useNoBufferedSize = useNoOne;

export const adjustSize = (size: number, alloc: number, min: number = 0) => {
  while (size < alloc * 0.125) alloc = Math.floor(alloc / 4);
  if (size > alloc) alloc = Math.max(size, (Math.round(alloc * 1.2) & 0xFFFFFFFC) + 4);
  return Math.max(min, alloc);
};
