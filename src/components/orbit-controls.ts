import { LiveComponent, LiveElement } from '../live/types';

import { useResource, useState } from '../live/hooks';

const π = Math.PI;
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));

const DEFAULT_OPTIONS = {
  bearingSpeed: 5,
  pitchSpeed: 5,
};

export type OrbitControlsProps = {
  bearingSpeed?: number,
  pitchSpeed?: number,
  canvas: HTMLCanvasElement,
  render: (phi: number, theta: number, radius: number) => LiveElement<any>,
};

export const OrbitControls: LiveComponent<OrbitControlsProps> = (context) => (props) => {
  const {
    bearingSpeed = DEFAULT_OPTIONS.bearingSpeed,
    pitchSpeed   = DEFAULT_OPTIONS.pitchSpeed, 
    canvas,
    render,
  } = props;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [radius, setRadius]   = useState<number>(context, 0)(5);
  const [bearing, setBearing] = useState<number>(context, 1)(0.6);
  const [pitch, setPitch]     = useState<number>(context, 2)(0.4);

  useResource(context, 3)(() => {
    const onMouseMove = (e: MouseEvent) => {
      const {buttons, movementX, movementY} = e;
      const size = Math.min(canvas.width, canvas.height);
      const speedX = bearingSpeed / size;
      const speedY = pitchSpeed   / size;

      if (buttons & 1) {
        setBearing((phi: number) => phi + movementX * speedX);
        setPitch((theta: number) => clamp(theta + movementY * speedY, -π/2, π/2));
      }
    };
    canvas.addEventListener('mousemove', onMouseMove);
    return () => canvas.removeEventListener('mousemove', onMouseMove);    
  }, [canvas]);

  return render(radius, bearing, pitch);
};
