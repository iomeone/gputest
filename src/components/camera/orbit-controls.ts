import { LiveComponent, LiveElement } from '@use-gpu/live/types';

import { useContext, useMemo, useOne, useResource, useState } from '@use-gpu/live';
import { MouseContext, WheelContext } from '../providers/event-provider';
import { LayoutContext } from '../providers/layout-provider';

const CAPTURE_EVENT = {capture: true};

const π = Math.PI;
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));

export type OrbitControlsProps = {
  bearingSpeed?: number,
  pitchSpeed?: number,
  render: (phi: number, theta: number, radius: number) => LiveElement<any>,
};

export const OrbitControls: LiveComponent<OrbitControlsProps> = (props) => {
  const {
    radius: initialRadius = 1,
    bearing: initialBearing = 0,
    pitch: initialPitch = 0,
    bearingSpeed = 5,
    pitchSpeed   = 5,
    render,
  } = props;

  const [radius, setRadius]   = useState<number>(initialRadius);
  const [bearing, setBearing] = useState<number>(initialBearing);
  const [pitch, setPitch]     = useState<number>(initialPitch);

  const { useMouse } = useContext(MouseContext);
  const { useWheel } = useContext(WheelContext);
  const layout = useContext(LayoutContext);

  const mouse = useMouse();
  const wheel = useWheel();
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
  }, mouse.version);

  useOne(() => {
    const {moveY} = wheel;
    const speedY = 1/100;
    if (moveY) setRadius((radius: number) => radius * (1 + moveY * speedY));
  }, wheel.version);

  return useMemo(() => render(radius, bearing, pitch), [render, radius, bearing, pitch]);
};
