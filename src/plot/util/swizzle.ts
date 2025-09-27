import { mat4 } from 'gl-matrix';
import { parseAxes } from '@use-gpu/traits';

const AXES = ['x', 'y', 'z', 'w'];

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
  return mat4.copy(m, values as any);
};

export const toBasis = (axes: string) => {
  return parseAxes(axes);
};

export const invertBasisSlow = (axes: string) => {
  const order = AXES.slice();
  let i = 0;
  for (const axis of axes) {
    const j = AXES.indexOf(axis);
    order[j] = AXES[i++];
  }
  return order.join('');
};

export const rotateBasisSlow = (axes: string) => axes.split('').map((x: string) => AXES[(AXES.indexOf(x) + 1) % 4]).join('');

export const rotateBasis = (axes: string, n: number) => {
  while (n < 0) n += 4;
  while (n > 3) n -= 4;
  for (let i = 0; i < n; ++i) axes = ROTATE_BASIS[axes];
  return axes;
}

export const invertBasis = (axes: string) => INVERT_BASIS[axes] ?? 'xyzw';

const BASES = [
  'xyzw',
  'xywz',
  'xzyw',
  'xzwy',
  'xwzy',
  'xwyz',

  'yxzw',
  'yxwz',
  'yzxw',
  'yzwx',
  'ywzx',
  'ywxz',

  'zxyw',
  'zxwy',
  'zyxw',
  'zywx',
  'zwyx',
  'zwxy',

  'wxyz',
  'wxzy',
  'wyxz',
  'wyzx',
  'wzyx',
  'wzxy',
];

export const INVERT_BASIS: Record<string, string> = {};
export const ROTATE_BASIS: Record<string, string> = {};
for (const basis of BASES) { INVERT_BASIS[basis] = invertBasisSlow(basis) };
for (const basis of BASES) { ROTATE_BASIS[basis] = rotateBasisSlow(basis) };
