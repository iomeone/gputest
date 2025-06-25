import type { XYZ, XYZW } from '@use-gpu/core';
import { solveLinear } from './matrix';
import { vec3 } from 'gl-matrix';

export const lineToRay = (a: XYZ, b: XYZ) => {
  const ray = vec3.sub(vec3.create(), b, a);
  return [a, ray];
};

export const rayToLine = (origin: XYZ, ray: XYZ) => {
  const b = vec3.add(vec3.create(), origin, ray);
  return [origin, b];
};

export const intersectRays = (
  origin1: XYZ, ray1: XYZ,
  origin2: XYZ, ray2: XYZ,
): [XYZ, XYZ] | null => {
  const dO = vec3.sub(vec3.create(), origin2, origin1);

  const a1 = -vec3.dot(ray1, ray1);
  const b1 =  vec3.dot(ray2, ray1);
  const c1 =  vec3.dot(dO, ray1);

  const a2 = -vec3.dot(ray1, ray2);
  const b2 =  vec3.dot(ray2, ray2);
  const c2 =  vec3.dot(dO, ray2);

  const A = [[a1, b1], [a2, b2]];
  const B = [-c1, -c2];

  const s = solveLinear(A, B);
  if (!s) return [null, null];

  const [t1, t2] = s;
  const p1 = vec3.scaleAndAdd(vec3.create(), origin1, ray1, t1);
  const p2 = vec3.scaleAndAdd(vec3.create(), origin2, ray2, t2);

  return [p1, p2];
};

export const intersectRayPlane = (
  origin: XYZ, ray: XYZ,
  plane: XYZW,
) => {
  const [,,, o] = plane;

  const n = vec3.clone(ray);
  vec3.normalize(n, n);

  const nr = vec3.dot(plane, n);
  if (!nr) return null;

  const t = -(vec3.dot(plane, origin) - o) / nr;
  return vec3.scaleAndAdd(vec3.create(), origin, n, t);
};
