import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { VectorLike } from '@use-gpu/traits';

import { parsePosition, useProp } from '@use-gpu/traits';
import { useContext, useMemo, useOne, useResource, useState } from '@use-gpu/live';
import { makeOrbitMatrix } from '@use-gpu/core';
import { MouseContext, WheelContext } from '../providers/event-provider';
import { LayoutContext } from '../providers/layout-provider';
import { useDerivedState } from '../hooks/useDerivedState';
import { mat4, vec3 } from 'gl-matrix';

const CAPTURE_EVENT = {capture: true};

const π = Math.PI;
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));

export type OrbitControlsProps = {
  radius?: number,
  bearing?: number,
  pitch?: number,
  target?: VectorLike,
  version?: number,

  radiusSpeed?: number,
  bearingSpeed?: number,
  pitchSpeed?: number,
  moveSpeed?: number,

  render: (phi: number, theta: number, radius: number, target: vec3) => LiveElement<any>,
};

export const OrbitControls: LiveComponent<OrbitControlsProps> = (props) => {
  const {
    radius: initialRadius = 1,
    bearing: initialBearing = 0,
    pitch: initialPitch = 0,
    version = 0,

    radiusSpeed  = 1/2,
    bearingSpeed = 5,
    pitchSpeed   = 5,
    moveSpeed    = 1,
    
    render,
  } = props;

  const initialTarget = useProp(props.target, parsePosition);

  const [radius, setRadius]   = useDerivedState<number>(initialRadius, version);
  const [bearing, setBearing] = useDerivedState<number>(initialBearing, version);
  const [pitch, setPitch]     = useDerivedState<number>(initialPitch, version);
  const [target, setTarget]   = useDerivedState<vec3>(initialTarget, version);

  const { useMouse } = useContext(MouseContext);
  const { useWheel } = useContext(WheelContext);
  const layout = useContext(LayoutContext);

  const { mouse } = useMouse();
  const { wheel } = useWheel();
  const size = Math.min(Math.abs(layout[2] - layout[0]), Math.abs(layout[3] - layout[1]));

  useOne(() => {
    const { x, y, moveX, moveY, buttons } = mouse;

    const speedX = bearingSpeed / size;
    const speedY = pitchSpeed   / size;

    if (buttons.left) {
      if (moveX || moveY) {
        setBearing((phi: number) => phi + moveX * speedX);
        setPitch((theta: number) => clamp(theta + moveY * speedY, -π/2, π/2));
      }
    }
    if (buttons.right) {
      if (moveX || moveY) {
        const m = makeOrbitMatrix(radius, bearing, pitch, [0, 0, 0], 1);
        m[12] = m[13] = m[14] = 0;
        mat4.invert(m, m);

        const speed = moveSpeed * radius;
        const move = vec3.fromValues(moveX * speed, -moveY * speed, 0);
        vec3.transformMat4(move, move, m);

        vec3.add(move, move, target);
        setTarget(move);
      }
    }
  }, mouse);

  useOne(() => {
    const {spinY} = wheel;
    const speedY = radiusSpeed;
    if (spinY) setRadius((radius: number) => radius * Math.pow(2, spinY * speedY));
  }, wheel);

  return useMemo(() => render(radius, bearing, pitch, target), [render, radius, bearing, pitch, target]);
};
