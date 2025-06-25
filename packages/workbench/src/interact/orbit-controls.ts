import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { VectorLike } from '@use-gpu/core';

import { useProp } from '@use-gpu/traits/live';
import { parseVec3 } from '@use-gpu/parse';
import { useContext, useCallback, useMemo, useHooks } from '@use-gpu/live';
import { makeOrbitMatrix, clamp } from '@use-gpu/core';
import { useDerivedState } from '../hooks/useDerivedState';
import { useShaderRef } from '../hooks/useShaderRef';
import { getRenderFunc } from '../hooks/useRenderProp';
import { matchActionBindings } from '../interact/hdi';
import { ActionMap, PointerEvent, WheelEvent } from '../interact/types';
import { useCanvasEvents } from '../providers/event-provider';
import { LayoutContext } from '../providers/layout-provider';
import { mat4, vec3 } from 'gl-matrix';

const π = Math.PI;
const maybeClamp = (x: number, a?: number, b?: number) => {
  if (a != null) x = Math.max(x, a);
  if (b != null) x = Math.min(x, b);
  return x;
};

export const ORBIT_CONTROLS_DEFAULT: ActionMap = {
  move: [
    {button: 'right'},
    {button: 'left', modifiers: ['shift']},
  ],
  rotate: [
    {button: 'left', notModifiers: ['shift']},
  ],
  zoom: [
    {wheel: true},
  ],
};

export type OrbitControlsProps = {
  radius?: number,
  bearing?: number,
  pitch?: number,
  target?: VectorLike,
  version?: number,

  actionBindings?: ActionMap,

  radiusSpeed?: number,
  bearingSpeed?: number,
  pitchSpeed?: number,
  moveSpeed?: number,

  minRadius?: number,
  maxRadius?: number,
  minBearing?: number,
  maxBearing?: number,
  minPitch?: number,
  maxPitch?: number,

  active?: boolean,
  render?: (radius: number, bearing: number, pitch: number, target: vec3) => LiveElement,
  children?: (radius: number, bearing: number, pitch: number, target: vec3) => LiveElement,
};

export const OrbitControls: LiveComponent<OrbitControlsProps> = (props) => {
  const {
    radius: initialRadius = 1,
    bearing: initialBearing = 0,
    pitch: initialPitch = 0,
    version = 0,

    actionBindings = ORBIT_CONTROLS_DEFAULT,

    radiusSpeed  = 1/2,
    bearingSpeed = 5,
    pitchSpeed   = 5,
    moveSpeed    = 1,

    minRadius,
    maxRadius,
    minBearing,
    maxBearing,
    minPitch,
    maxPitch,

    active = true,
  } = props;

  const initialTarget = useProp(props.target, parseVec3);

  const [radius, setRadius]   = useDerivedState<number>(initialRadius, version);
  const [bearing, setBearing] = useDerivedState<number>(initialBearing, version);
  const [pitch, setPitch]     = useDerivedState<number>(initialPitch, version);
  const [target, setTarget]   = useDerivedState<vec3>(initialTarget, version);

  const layout = useContext(LayoutContext);

  const size = Math.min(Math.abs(layout[2] - layout[0]), Math.abs(layout[3] - layout[1]));
  const radiusRef = useShaderRef(radius);

  const matrix = useMemo(() => {
    const m = makeOrbitMatrix(radius, bearing, pitch, [0, 0, 0], 1);
    m[12] = m[13] = m[14] = 0;
    mat4.invert(m, m);
    return m;
  }, [radius, bearing, pitch]);
  const matrixRef = useShaderRef(matrix);

  const handleMove = useCallback((moveX: number, moveY: number) => {
    const {current: matrix} = matrixRef;
    const {current: radius} = radiusRef;

    const speed = moveSpeed * radius / size;
    const move = vec3.fromValues(moveX * speed, -moveY * speed, 0);
    vec3.transformMat4(move, move, matrix);

    setTarget(target => vec3.add(move, move, target));
  }, [moveSpeed, size, matrixRef, radiusRef, setTarget]);

  const handleRotate = useCallback((moveX: number, moveY: number) => {
    const speedX = bearingSpeed / size;
    const speedY = pitchSpeed   / size;

    setBearing((phi: number) => maybeClamp(phi + moveX * speedX, minBearing, maxBearing));
    setPitch((theta: number) => clamp(theta + moveY * speedY, minPitch ?? (-π/2 + 1e-5), maxPitch ?? (π/2 - 1e-5)));
  }, [bearingSpeed, pitchSpeed, minBearing, maxBearing, minPitch, maxPitch, setBearing, setPitch, size]);

  const handleZoom = useCallback((spinY: number) => {
    const speedY = radiusSpeed;

    setRadius((radius: number) => maybeClamp(radius * Math.pow(2, spinY * speedY), minRadius, maxRadius))
  }, [radiusSpeed, minRadius, maxRadius, setRadius]);

  const handleEvent = useCallback((event: PointerEvent | WheelEvent) => {
    const { moveX, moveY, spinY } = event as WheelEvent;

    if (matchActionBindings(event, actionBindings.move)) {
      const sign = event.type === 'wheel' ? 1 : -1;
      if (moveX || moveY) {
        handleMove(sign * moveX, sign * moveY);
      }
    }
    else if (matchActionBindings(event, actionBindings.rotate)) {
      if (moveX || moveY) {
        handleRotate(moveX, moveY);
      }
    }
    else if (matchActionBindings(event, actionBindings.zoom)) {
      const y = spinY ?? moveY;
      if (y) {
        handleZoom(y);
      }
    }
    else {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
  }, [actionBindings, handleMove, handleRotate, handleZoom]);

  const callbacks = useMemo(() => ({
    pointerMove: handleEvent,
    wheel: handleEvent,
  }), [handleEvent]);
  const handlers = useCanvasEvents(null, callbacks);

  const render = getRenderFunc(props);
  return [
    active ? handlers : null,
    useHooks(() => render?.(radius, bearing, pitch, target), [render, radius, bearing, pitch, target]),
  ];
};
