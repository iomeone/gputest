export const incrementVersion = (v: number) => (((v + 1) | 0) >>> 0) || 1;

export const makeIdAllocator = (first = 1) => {
  const used = new Set<number>();

  let version = 0;
  let i = first;
  let max = first;

  return {
    obtain: () => {
      while (used.has(i)) i++;
      used.add(i);
      max = Math.max(max, i);

      version = incrementVersion(version);
      return i;
    },
    release: (j: number) => {
      used.delete(j);
      if (used.size) {
        i = Math.min(i, j);
        while (!used.has(max)) max--;
      }
      else {
        i = max = first;
      }

      version = incrementVersion(version);
    },

    version: () => version,
    size: () => used.size,
    all: () => used.values(),
    max: () => max,
  };
};
