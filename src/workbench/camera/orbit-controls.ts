import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { VectorLike } from '@use-gpu/core';

import { useProp } from '@use-gpu/traits/live';
import { parseVec3 } from '@use-gpu/parse';
import { useContext, useOne, useHooks } from '@use-gpu/live';
import { makeOrbitMatrix, clamp } from '@use-gpu/core';
import { KeyboardContext, MouseContext, WheelContext } from '../providers/event-provider';
import { LayoutContext } from '../providers/layout-provider';
import { useDerivedState } from '../hooks/useDerivedState';
import { getRenderFunc } from '../hooks/useRenderProp';
import { mat4, vec3 } from 'gl-matrix';

const π = Math.PI;
const maybeClamp = (x: number, a?: number, b?: number) => {
  if (a != null) x = Math.max(x, a);
  if (b != null) x = Math.min(x, b);
  return x;
};

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

  const { useMouse } = useContext(MouseContext);
  const { useWheel } = useContext(WheelContext);
  const { useKeyboard } = useContext(KeyboardContext);

  const layout = useContext(LayoutContext);

  const { mouse } = useMouse();
  const { wheel, stop: stopWheel } = useWheel();
  const { keyboard } = useKeyboard();

  const size = Math.min(Math.abs(layout[2] - layout[0]), Math.abs(layout[3] - layout[1]));

  const handleMove = (moveX: number, moveY: number) => {
    const m = makeOrbitMatrix(radius, bearing, pitch, [0, 0, 0], 1);
    m[12] = m[13] = m[14] = 0;
    mat4.invert(m, m);

    const speed = moveSpeed * radius / size;
    const move = vec3.fromValues(moveX * speed, -moveY * speed, 0);
    vec3.transformMat4(move, move, m);

    vec3.add(move, move, target);
    setTarget(move);
  }

  useOne(() => {
    const { moveX, moveY, buttons, stopped } = mouse;
    if (!active || stopped) return;

    const speedX = bearingSpeed / size;
    const speedY = pitchSpeed   / size;

    if (buttons.right || (buttons.left && keyboard.modifiers.shift)) {
      if (moveX || moveY) {
        handleMove(-moveX, -moveY);
      }
    }
    else if (buttons.left) {
      if (moveX || moveY) {
        setBearing((phi: number) => maybeClamp(phi + moveX * speedX, minBearing, maxBearing));
        setPitch((theta: number) => clamp(theta + moveY * speedY, minPitch ?? (-π/2 + 1e-5), maxPitch ?? (π/2 - 1e-5)));
      }
    }
  }, mouse);

  useOne(() => {
    const {moveX, moveY, spinY, stopped} = wheel;
    const speedY = radiusSpeed;
    if (!active || stopped) return;

    if (keyboard.modifiers.shift) {
      if (moveX || moveY) {
        handleMove(moveX, moveY);
      }
    }
    else if (spinY) setRadius((radius: number) => maybeClamp(radius * Math.pow(2, spinY * speedY), minRadius, maxRadius));

    if (active) stopWheel();
  }, wheel);

  const render = getRenderFunc(props);
  return useHooks(() => render?.(radius, bearing, pitch, target), [render, radius, bearing, pitch, target]);
};
