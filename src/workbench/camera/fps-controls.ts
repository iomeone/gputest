import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { VectorLike } from '@use-gpu/traits';

import { parsePosition, useProp } from '@use-gpu/traits';
import { useContext, useYolo, useOne, useRef, useResource, useState } from '@use-gpu/live';
import { makeOrbitMatrix } from '@use-gpu/core';
import { useAnimationFrame, useNoAnimationFrame } from '../providers/loop-provider';
import { KeyboardContext, MouseContext } from '../providers/event-provider';
import { usePerFrame } from '../providers/frame-provider';
import { LayoutContext } from '../providers/layout-provider';
import { useDerivedState } from '../hooks/useDerivedState';
import { mat4, vec3 } from 'gl-matrix';

const CAPTURE_EVENT = {capture: true};

const π = Math.PI;
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));

export type FPSControlsProps = {
  position?: VectorLike,

  bearing?: number,
  pitch?: number,
  version?: number,

  bearingSpeed?: number,
  pitchSpeed?: number,
  moveSpeed?: number,

  active?: boolean,
  render: (phi: number, theta: number, position: vec3) => LiveElement,
};

export const FPSControls: LiveComponent<FPSControlsProps> = (props) => {
  const {
    bearing: initialBearing = 0,
    pitch: initialPitch = 0,
    version = 0,

    bearingSpeed = 5,
    pitchSpeed   = 5,
    moveSpeed    = 15,
    
    active = true,
    render,
  } = props;

  const initialPosition = useProp(props.position, parsePosition);

  const [bearing, setBearing]   = useDerivedState<number>(initialBearing, version);
  const [pitch, setPitch]       = useDerivedState<number>(initialPitch, version);
  const [position, setPosition] = useDerivedState<vec3>(initialPosition, version);

  const [velocity, setVelocity] = useState<vec3>(() => vec3.create());

  const { useMouse, hasLock, beginLock, endLock } = useContext(MouseContext);
  const { useKeyboard } = useContext(KeyboardContext);

  const layout = useContext(LayoutContext);
  const frame = usePerFrame();

  const { mouse } = useMouse();
  const { keyboard } = useKeyboard();

  const size = Math.min(Math.abs(layout[2] - layout[0]), Math.abs(layout[3] - layout[1]));

  const lastTimeRef = useRef(0);

  useOne(() => {
    const { x, y, moveX, moveY, buttons, stopped } = mouse;
    if (!active || stopped) return;

    if (!hasLock) {
      if (buttons.left) {
        beginLock();
      }
    }
    else {
      const speedX = bearingSpeed / size;
      const speedY = pitchSpeed   / size;

      if (moveX || moveY) {
        setBearing((phi: number) => phi + moveX * speedX);
        setPitch((theta: number) => clamp(theta + moveY * speedY, -π/2, π/2));
      }
    }
  }, mouse);

  useOne(() => {
    const { keys, stopped } = keyboard;
    if (!active || stopped) return;

    let dx = 0;
    let dy = 0;
    let dz = 0;

    if (keys.a) dx -= 1;
    if (keys.d) dx += 1;
    if (keys.w) dy -= 1;
    if (keys.s) dy += 1;
    if (keys.e) dz -= 1;
    if (keys.q) dz += 1;

    let dl = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (keys.shift) dl /= 4;

    setVelocity(vec3.fromValues(
      dl ? dx / dl : 0,
      dl ? dy / dl : 0,
      dl ? dz / dl : 0,
    ));

    const now = +new Date() / 1000;
    lastTimeRef.current = now;
  }, keyboard);

  const moving = vec3.length(velocity);

  useOne(() => {
    if (!moving) return;

    const m = makeOrbitMatrix(0, bearing, pitch, [0, 0, 0], 1);
    m[12] = m[13] = m[14] = 0;
    mat4.invert(m, m);

    const now = +new Date() / 1000;
    if (lastTimeRef.current) {
      const delta = now - lastTimeRef.current;

      const speed = moveSpeed * delta;
      const move = vec3.fromValues(velocity[0] * speed, velocity[2] * speed, velocity[1] * speed);
      vec3.transformMat4(move, move, m);

      vec3.add(move, move, position);
      setPosition(move);
    }

    lastTimeRef.current = now;
  }, frame);

  if (moving) useAnimationFrame();
  else useNoAnimationFrame();

  return useYolo(() => render(bearing, pitch, position), [render, bearing, pitch, position]);
};
