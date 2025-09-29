import { useOne, useNoOne } from '@use-gpu/live';

// Return enough space to hold at least `size` items while resizing exponentially.
export const useBufferedSize = (size: number) => {
  const ref = useOne(() => ({alloc: 0}));
  return ref.alloc = adjustSize(size, ref.alloc);  
};

export const useNoBufferedSize = useNoOne;

export const adjustSize = (size: number, alloc: number) => {
  while (size < alloc * 0.125) alloc = Math.floor(alloc / 4);
  if (size > alloc) alloc = Math.max(size, Math.round(alloc * 1.2)|7);
  return Math.max(4, Math.ceil(alloc / 4) * 4);
};
