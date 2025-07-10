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

export const getAbsoluteFrame = (m: mat4) => {
  const v = vec3.create();
  mat4.getTranslation(v, m);

  const s = mat4.fromTranslation(mat4.create(), v);
  return s;
};

export const lineConstraint = (line: XYZ[]) => {
  const [origin, ray] = lineToRay(line[0], line[1]);
  return (o: XYZ, r: XYZ) => {
    return intersectRays(origin, ray, o, r)?.[0] ?? null;
  };
};

export const planeConstraint = (plane: XYZW) => (origin: XYZ, ray: XYZ) => intersectRayPlane(origin, ray, plane) as XYZ | null;

export const polarTangentConstraint = (axis: number, anchor: XYZ) => {
  const a = vec3.clone(anchor);
  a[axis] = 0;

  const n: XYZ = [0, 0, 0];
  n[axis] = 1;

  const b = vec3.cross(vec3.create(), anchor, n);
  vec3.normalize(b, b);
  vec3.add(b, b, a);

  return lineConstraint([a, b] as any);
};

export const applyCartesianDrag = (axes: number[], absolute?: boolean) => (snapshot: mat4, anchor: XYZ, hit: XYZ) => {
  const v = vec3.clone(hit);
  vec3.sub(v, v, anchor);

  const d: XYZ = [0, 0, 0];
  for (const i of axes) d[i] = v[i];

  const m = mat4.create();
  mat4.fromTranslation(m, d as vec3);
  if (absolute) mat4.multiply(m, m, snapshot);
  else mat4.multiply(m, snapshot, m);

  return m;
};

export const applyScaleDrag = (
  axis: number,
  absolute?: boolean,
  negative?: boolean,
  nonUniform?: boolean,
) => (snapshot: mat4, anchor: XYZ, hit: XYZ) => {
  let d: XYZ = [1, 1, 1];

  let s = hit[axis] / anchor[axis];
  if (!negative) s = Math.max(s, 1e-3);
  
  if (nonUniform) d[axis] = s;
  else d = [s, s, s];

  const m = mat4.create();
  mat4.fromScaling(m, d as vec3);

  if (absolute) {
    const v = vec3.create();
    const s = mat4.create();

    mat4.getTranslation(v, snapshot);

    // Undo translation
    mat4.fromTranslation(s, [-v[0], -v[1], -v[2]]);
    mat4.multiply(s, s, snapshot);
    
    // Rotate
    mat4.multiply(m, m, s);

    // Apply translation
    mat4.fromTranslation(s, v);
    mat4.multiply(m, s, m);
  }
  else mat4.multiply(m, snapshot, m);

  return m;
};

export const applyPolarDrag = (axis: number, absolute?: boolean) => (snapshot: mat4, anchor: XYZ, hit: XYZ) => {
  const n: XYZ = [0, 0, 0];
  n[axis] = 1;

  const tangent = vec3.cross(vec3.create(), anchor, n);
  vec3.normalize(tangent, tangent);
  
  const diff = vec3.sub(vec3.create(), hit, anchor);
  const r = vec3.length(anchor as vec3);
  const th = -vec3.dot(diff, tangent) / r;
  
  const v = vec3.create();
  const m = mat4.create();
  const s = mat4.create();

  mat4.fromRotation(m, th, n);

  if (absolute) {
    mat4.getTranslation(v, snapshot);

    // Undo translation
    mat4.fromTranslation(s, [-v[0], -v[1], -v[2]]);
    mat4.multiply(s, s, snapshot);
    
    // Rotate
    mat4.multiply(m, m, s);

    // Apply translation
    mat4.fromTranslation(s, v);
    mat4.multiply(m, s, m);
  }
  else {
    mat4.getScaling(v, snapshot);

    // Undo scaling
    mat4.fromScaling(s, [1/v[0], 1/v[1], 1/v[2]]);
    mat4.multiply(s, snapshot, s);
    
    // Rotate
    mat4.multiply(m, s, m);

    // Apply scaling
    mat4.fromScaling(s, [v[0], v[1], v[2]]);
    mat4.multiply(m, m, s);
  }

  return m;
};

type HitTest = (origin: XYZ, ray: XYZ) => XYZ | null;
type ApplyDrag = (snapshot: mat4, anchor: XYZ, hit: XYZ) => mat4;

type DragGesture = {
  hit?: HitTest,
  apply: ApplyDrag,
};

export const useDrag = (
  hit: HitTest,
  get: (anchor: XYZ) => DragGesture,

  frame: mat4,
  value: mat4,
  onDragMove: (value: mat4) => void,
  onDragState: (dragging: boolean) => void,
) => {
  const {pick} = useViewContext();

  const [dragFrame, setDragFrame] = useState<mat4 | null>(null);
  const [dragGesture, setDragGesture] = useState<DragGesture | null>(null);
  const [dragSnapshot, setDragSnapshot] = useState<mat4 | null>(null);
  const [dragAnchor, setDragAnchor] = useState<XYZ | null>(null);

  const i = mat4.invert(mat4.create(), frame);

  const handlePointerDown = (e: PointerEvent) => {
    const [origin, ray] = pick(e);
    const [lo, lr] = transformRay(origin, ray, i);
    const dragHit = hit(lo, lr);
    if (!dragHit) return;
    
    const dragGesture = get(dragHit);

    setDragFrame(i);
    setDragSnapshot(value);
    setDragAnchor(dragHit);
    setDragGesture(dragGesture);
    onDragState(true);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!dragFrame || !dragSnapshot || !dragAnchor || !dragGesture) return;

    const [origin, ray] = pick(e);
    const [lo, lr] = transformRay(origin, ray, dragFrame);
    const dragHit = (dragGesture.hit ?? hit)(lo, lr);
    if (!dragHit) return;

    const value = dragGesture.apply(dragSnapshot, dragAnchor, dragHit);
    onDragMove(value);
  };

  const handlePointerUp = () => {
    setDragFrame(null);
    setDragSnapshot(null);
    setDragAnchor(null);
    setDragGesture(null);
    onDragState(false);
  };

  return {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
  };
};
