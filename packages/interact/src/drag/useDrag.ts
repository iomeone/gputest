import type { XYZ, XYZW } from '@use-gpu/core';
import { useState } from '@use-gpu/live';
import { PointerEvent, useCanvasEvents, useViewContext } from '@use-gpu/workbench';

import { lineToRay, rayToLine, intersectRays, intersectRayPlane } from '../util/intersect';
import { vec3 } from 'gl-matrix';

export const useLineDrag = (
  line: XYZ[],
  getSnapshot: () => XYZ,
  onDragMove: (offset: XYZ) => void,
  onDragState: (dragging: boolean) => void,
) => {
  const [origin, ray] = lineToRay(line[0], line[1]);
  const hit = (o: XYZ, r: XYZ) => {
    return intersectRays(origin, ray, o, r)[0];
  };
  return useDrag(hit, getSnapshot, onDragMove, onDragState);
};

export const usePlaneDrag = (
  plane: XYZW,
  getSnapshot: () => XYZ,
  onDragMove: (offset: XYZ) => void,
  onDragState: (dragging: boolean) => void,
) => {
  const hit = (origin: XYZ, ray: XYZ) => {
    return intersectRayPlane(origin, ray, plane);
  };
  return useDrag(hit, getSnapshot, onDragMove, onDragState);
};

export const useDrag = (
  hit: (origin: XYZ, ray: XYZ) => XYZ,
  getSnapshot: () => XYZ,
  onDragMove: (offset: XYZ) => void,
  onDragState: (dragging: boolean) => void,
) => {
  const {pick} = useViewContext();

  const [dragSnapshot, setDragSnapshot] = useState<XYZ | null>(null);
  const [dragAnchor, setDragAnchor] = useState<XYZ | null>(null);

  const handlePointerDown = (e: PointerEvent) => {
    console.log('down', e);

    const [origin, ray] = pick(e);
    const point = hit(origin, ray);

    setDragSnapshot(getSnapshot());
    setDragAnchor(point);
    onDragState(true);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!dragSnapshot || !dragAnchor) return;

    const [origin, ray] = pick(e);
    const point = hit(origin, ray);

    const offset = vec3.sub(vec3.create(), point, dragAnchor);
    vec3.add(offset, offset, dragSnapshot);

    onDragMove(offset);
  };

  const handlePointerUp = (e: PointerEvent) => {
    console.log('up', e);

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
