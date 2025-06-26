import type { XYZ, XYZW } from '@use-gpu/core';
import { useState } from '@use-gpu/live';
import { PointerEvent, useViewContext } from '@use-gpu/workbench';

import { transformRay, lineToRay, intersectRays, intersectRayPlane } from '../util/intersect';
import { mat4, vec3 } from 'gl-matrix';

export const ORTHO_AXES_XYZ = [
  [1, 2],
  [2, 0],
  [0, 1],
];

export const getDragFrame = (m: mat4) => {
  const v = vec3.create();
  mat4.getScaling(v, m);

  const s = mat4.fromScaling(mat4.create(), [1/v[0], 1/v[1], 1/v[2]]);
  mat4.multiply(s, m, s);

  return s;
};

export const lineConstraint = (line: XYZ[]) => {
  const [origin, ray] = lineToRay(line[0], line[1]);
  return (o: XYZ, r: XYZ) => {
    return intersectRays(origin, ray, o, r)[0];
  };
};

export const planeConstraint = (plane: XYZW) => (origin: XYZ, ray: XYZ) => intersectRayPlane(origin, ray, plane);

export const circleConstraint = (plane: XYZW, center: XYZ, radius: number) => (origin: XYZ, ray: XYZ) => {
  const point = intersectRayPlane(origin, ray, plane);
  if (!point) return;

  vec3.sub(point, point, center);
  vec3.normalize(point, point);
  vec3.scale(point, point, radius);

  return point;
};

export const applyCartesianDrag = (axes: number[]) => (snapshot: mat4, anchor: XYZ, hit: XYZ) => {
  const v = vec3.clone(hit);
  vec3.sub(v, v, anchor);

  const d = [0, 0, 0];
  for (const i of axes) d[i] = v[i];

  const m = mat4.create();
  mat4.fromTranslation(m, d);
  mat4.multiply(m, snapshot, m);

  return m;
};

export const applyScaleDrag = (axes: number[]) => (snapshot: mat4, anchor: XYZ, hit: XYZ) => {
  const d = [1, 1, 1];
  for (const i of axes) d[i] = hit[i] / anchor[i];

  const m = mat4.create();
  mat4.fromScaling(m, d);
  mat4.multiply(m, snapshot, m);

  return m;
};

export const applyPolarDrag = (axis: number) => (snapshot: mat4, anchor: XYZ, hit: XYZ) => {
  const axes = ORTHO_AXES_XYZ[axis];

  const va = axes.map(i => anchor[i]);
  const vh = axes.map(i => hit[i]);

  const n = [0, 0, 0];
  n[axis] = 1;

  const th1 = Math.atan2(va[1], va[0]);
  const th2 = Math.atan2(vh[1], vh[0]);
  const th = th2 - th1;

  const v = vec3.create();
  mat4.getScaling(v, snapshot);

  const s = mat4.create();
  mat4.fromScaling(s, [1/v[0], 1/v[1], 1/v[2]]);
  mat4.multiply(s, snapshot, s);

  const m = mat4.create();
  mat4.fromRotation(m, th, n);
  mat4.multiply(m, s, m);

  mat4.fromScaling(s, [v[0], v[1], v[2]]);
  mat4.multiply(m, m, s);

  return m;
};

export const useDrag = (
  hit: (origin: XYZ, ray: XYZ) => XYZ,
  applyDrag: (snapshot: mat4, anchor: XYZ, hit: XYZ) => mat4,

  frame: mat4,
  value: mat4,
  onDragMove: (value: mat4) => void,
  onDragState: (dragging: boolean) => void,
) => {
  const {pick} = useViewContext();

  const [dragFrame, setDragFrame] = useState<mat4 | null>(null);
  const [dragSnapshot, setDragSnapshot] = useState<mat4 | null>(null);
  const [dragAnchor, setDragAnchor] = useState<XYZ | null>(null);

  const i = mat4.invert(mat4.create(), value);

  const handlePointerDown = (e: PointerEvent) => {
    console.log('down', e);

    const [origin, ray] = pick(e);
    const [lo, lr] = transformRay(origin, ray, i);
    const dragHit = hit(lo, lr);

    setDragFrame(i);
    setDragSnapshot(value);
    setDragAnchor(dragHit);
    onDragState(true);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!dragFrame || !dragSnapshot || !dragAnchor) return;

    const [origin, ray] = pick(e);
    const [lo, lr] = transformRay(origin, ray, dragFrame);
    const dragHit = hit(lo, lr);

    const value = applyDrag(dragSnapshot, dragAnchor, dragHit);
    onDragMove(value);
  };

  const handlePointerUp = (e: PointerEvent) => {
    console.log('up', e);

    setDragFrame(null);
    setDragSnapshot(null);
    setDragAnchor(null);
    onDragState(false);
  };

  return {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
  };
};
