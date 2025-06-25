import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { VectorLike } from '@use-gpu/core';

import { useProp } from '@use-gpu/traits/live';
import { parseVec3 } from '@use-gpu/parse';
import { useCallback, useContext, useHooks, useMemo, useOne, useRef, useState } from '@use-gpu/live';
import { makeOrbitMatrix, clamp } from '@use-gpu/core';
import { PointerEvent } from '../interact/types';
import { useAnimationFrame, useNoAnimationFrame } from '../providers/loop-provider';
import { useCanvasEvents, useKeyboardState, usePointerLock } from '../providers/event-provider';
import { usePerFrame } from '../providers/frame-provider';
import { LayoutContext } from '../providers/layout-provider';
import { useDerivedState } from '../hooks/useDerivedState';
import { getRenderFunc } from '../hooks/useRenderProp';
import { mat4, vec3 } from 'gl-matrix';

const π = Math.PI;

export type FPSControlsProps = {
  position?: VectorLike,

  bearing?: number,
  pitch?: number,
  version?: number,

  bearingSpeed?: number,
  pitchSpeed?: number,
  moveSpeed?: number,

  active?: boolean,
  render?: (phi: number, theta: number, position: vec3) => LiveElement,
  children?: (phi: number, theta: number, position: vec3) => LiveElement,
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
  } = props;

  const initialPosition = useProp(props.position, parseVec3);

  const [bearing, setBearing]   = useDerivedState<number>(initialBearing, version);
  const [pitch, setPitch]       = useDerivedState<number>(initialPitch, version);
  const [position, setPosition] = useDerivedState<vec3>(initialPosition, version);

  const [velocity, setVelocity] = useState<vec3>(() => vec3.create());

  const layout = useContext(LayoutContext);
  const frame = usePerFrame();

  const keyboard = useKeyboardState();
  const { hasLock, beginLock } = usePointerLock();

  const size = Math.min(Math.abs(layout[2] - layout[0]), Math.abs(layout[3] - layout[1]));

  const lastTimeRef = useRef(0);

  const handlePointerDown = useCallback((event: PointerEvent) => {
    if (hasLock()) return;

    const { buttons } = event;
    if (buttons.left) {
      beginLock();
    }
  }, [hasLock, beginLock]);

  const handlePointerMove = useCallback((event: PointerEvent) => {
    if (!hasLock()) return;

    const { moveX, moveY } = event;

    const speedX = bearingSpeed / size;
    const speedY = pitchSpeed   / size;

    if (moveX || moveY) {
      setBearing((phi: number) => phi + moveX * speedX);
      setPitch((theta: number) => clamp(theta + moveY * speedY, -π/2, π/2));
    }
  }, [hasLock, size, bearingSpeed, pitchSpeed, setBearing, setPitch]);

  useOne(() => {
    if (!active) return;

    let dx = 0;
    let dy = 0;
    let dz = 0;

    if (keyboard.a) dx -= 1;
    if (keyboard.d) dx += 1;
    if (keyboard.w) dy -= 1;
    if (keyboard.s) dy += 1;
    if (keyboard.e) dz -= 1;
    if (keyboard.q) dz += 1;

    let dl = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (keyboard.shift) dl /= 4;

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

  const callbacks = useMemo(() => ({
    pointerDown: handlePointerDown,
    pointerMove: handlePointerMove,
  }), [handlePointerDown, handlePointerMove]);

  const handlers = useCanvasEvents(null, callbacks);

  const render = getRenderFunc(props);
  return [
    active ? handlers : null,
    useHooks(() => render?.(bearing, pitch, position), [render, bearing, pitch, position]),
  ];
};
