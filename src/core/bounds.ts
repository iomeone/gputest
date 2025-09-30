import type { VectorLike, DataBoundingBox, DataBounds } from './types';
import { seq } from './tuple';

export const makeBoundingBox = (dims: number): DataBoundingBox => {
  return {
    min: seq(dims).map(() => Infinity),
    max: seq(dims).map(() => -Infinity),
  };
};

export const getBoundingBox = (data: VectorLike, dims: number): DataBoundingBox => {
  const n = data.length / dims;

  if (dims === 1) {
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < n; ++i) {
      const d = data[i];
      min = Math.min(min, d);
      max = Math.max(max, d);
    }
    return {min: [min], max: [max]};
  }

  if (dims === 2) {
    let minX = Infinity;
    let maxX = -Infinity;

    let minY = Infinity;
    let maxY = -Infinity;

    for (let i = 0, j = 0; i < n; ++i, j += 2) {
      const dx = data[j];
      const dy = data[j + 1];
      minX = Math.min(minX, dx);
      maxX = Math.max(maxX, dx);

      minY = Math.min(minY, dy);
      maxY = Math.max(maxY, dy);
    }
    return {min: [minX, minY], max: [maxX, maxY]};
  }

  if (dims === 3) {
    let minX = Infinity;
    let maxX = -Infinity;

    let minY = Infinity;
    let maxY = -Infinity;

    let minZ = Infinity;
    let maxZ = -Infinity;

    for (let i = 0, j = 0; i < n; ++i, j += 3) {
      const dx = data[j];
      const dy = data[j + 1];
      const dz = data[j + 2];

      minX = Math.min(minX, dx);
      maxX = Math.max(maxX, dx);

      minY = Math.min(minY, dy);
      maxY = Math.max(maxY, dy);

      minZ = Math.min(minZ, dz);
      maxZ = Math.max(maxZ, dz);
    }
    return {min: [minX, minY, minZ], max: [maxX, maxY, maxZ]};
  }

  if (dims === 4) {
    let minX = Infinity;
    let maxX = -Infinity;

    let minY = Infinity;
    let maxY = -Infinity;

    let minZ = Infinity;
    let maxZ = -Infinity;

    let minW = Infinity;
    let maxW = -Infinity;

    for (let i = 0, j = 0; i < n; ++i, j += 4) {
      const dx = data[j];
      const dy = data[j + 1];
      const dz = data[j + 2];
      const dw = data[j + 3];

      minX = Math.min(minX, dx);
      maxX = Math.max(maxX, dx);

      minY = Math.min(minY, dy);
      maxY = Math.max(maxY, dy);

      minZ = Math.min(minZ, dz);
      maxZ = Math.max(maxZ, dz);

      minW = Math.min(minW, dw);
      maxW = Math.max(maxW, dw);
    }
    return {min: [minX, minY, minZ, minW], max: [maxX, maxY, maxZ, maxW]};
  }

  const min = seq(dims).map(() => Infinity);
  const max = seq(dims).map(() => -Infinity);
  for (let i = 0, j = 0; i < n; ++i, j += dims) {
    for (let k = 0; k < dims; ++k) {
      const d = data[j];

      min[k] = Math.min(min[k], d);
      max[k] = Math.max(max[k], d);
    }
  }

  return {min, max};
};

export const extendBoundingBox = (box: DataBoundingBox, data: VectorLike, dims: number) => {
  const n = data.length / dims;
  const {min, max} = box;

  if (dims === 1) {
    for (let i = 0; i < n; ++i) {
      const d = data[i];
      min[0] = Math.min(min[0], d);
      max[0] = Math.max(max[0], d);
    }
    return;
  }

  if (dims === 2) {
    for (let i = 0, j = 0; i < n; ++i, j += 2) {
      const dx = data[j];
      const dy = data[j + 1];
      min[0] = Math.min(min[0], dx);
      max[0] = Math.max(max[0], dx);

      min[1] = Math.min(min[1], dy);
      max[1] = Math.max(max[1], dy);
    }
    return;
  }

  if (dims === 3) {
    for (let i = 0, j = 0; i < n; ++i, j += 3) {
      const dx = data[j];
      const dy = data[j + 1];
      const dz = data[j + 2];

      min[0] = Math.min(min[0], dx);
      max[0] = Math.max(max[0], dx);

      min[1] = Math.min(min[1], dy);
      max[1] = Math.max(max[1], dy);

      min[2] = Math.min(min[2], dz);
      max[2] = Math.max(max[2], dz);
    }
    return;
  }

  if (dims === 4) {
    for (let i = 0, j = 0; i < n; ++i, j += 4) {
      const dx = data[j];
      const dy = data[j + 1];
      const dz = data[j + 2];
      const dw = data[j + 3];

      min[0] = Math.min(min[0], dx);
      max[0] = Math.max(max[0], dx);

      min[1] = Math.min(min[1], dy);
      max[1] = Math.max(max[1], dy);

      min[2] = Math.min(min[2], dz);
      max[2] = Math.max(max[2], dz);

      min[3] = Math.min(min[3], dw);
      max[3] = Math.max(max[3], dw);
    }
    return;
  }

  for (let i = 0, j = 0; i < n; ++i, j += dims) {
    for (let k = 0; k < dims; ++k) {
      const d = data[j];

      min[k] = Math.min(min[k], d);
      max[k] = Math.max(max[k], d);
    }
  }

  return;
};

export const toDataBounds = (box: DataBoundingBox): DataBounds => {
  const {min, max} = box;
  const dims = min.length;

  if (dims === 1) {
    return {
      center: [(min[0] + max[0]) / 2],
      radius: (max[0] - min[0]) / 2,
      min,
      max,
    };
  }

  if (dims === 2) {
    const cx = (min[0] + max[0]) / 2;
    const cy = (min[1] + max[1]) / 2;

    const dx = (max[0] - min[0]) / 2;
    const dy = (max[1] - min[1]) / 2;
    const d = Math.sqrt(dx*dx + dy*dy);

    return {center: [cx, cy], radius: d, min, max};
  }

  if (dims === 3) {
    const cx = (min[0] + max[0]) / 2;
    const cy = (min[1] + max[1]) / 2;
    const cz = (min[2] + max[2]) / 2;

    const dx = (max[0] - min[0]) / 2;
    const dy = (max[1] - min[1]) / 2;
    const dz = (max[2] - min[2]) / 2;
    const d = Math.sqrt(dx*dx + dy*dy + dz*dz);

    return {center: [cx, cy, cz], radius: d, min, max};
  }

  if (dims === 4) {
    const cx = (min[0] + max[0]) / 2;
    const cy = (min[1] + max[1]) / 2;
    const cz = (min[2] + max[2]) / 2;
    const cw = (min[3] + max[3]) / 2;

    const dx = (max[0] - min[0]) / 2;
    const dy = (max[1] - min[1]) / 2;
    const dz = (max[2] - min[2]) / 2;
    const dw = (max[3] - min[3]) / 2;
    const d = Math.sqrt(dx*dx + dy*dy + dz*dz + dw*dw);

    return {center: [cx, cy, cz, cw], radius: d, min, max};
  }

  return {
    center: min.map((v: number, i: number) => (v + max[i]) / 2),
    radius: Math.sqrt(
      (min as number[])
      .map((v: number, i: number) => (max[i] - v) / 2)
      .map((v: number) => v * v)
      .reduce((a: number, b: number) => a + b, 0)
    ),
    min,
    max,
  };
};
