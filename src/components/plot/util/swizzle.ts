import { mat4 } from 'gl-matrix';

export const swizzleMatrix = (m: mat4, swizzle: string) => {
  let values = [];
  let n = swizzle.length;
  for (let i = 0; i < n; ++i) {
    const c = swizzle[i];
    if (c === 'x') values.push(1, 0, 0, 0);
    if (c === 'y') values.push(0, 1, 0, 0);
    if (c === 'z') values.push(0, 0, 1, 0);
    if (c === 'w') values.push(0, 0, 0, 1);
  }
  return mat4.copy(m, values);
};
