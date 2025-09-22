import { LiveComponent, LiveElement } from '@use-gpu/live/types';

import { useResource, useState } from '@use-gpu/live';

const CAPTURE_EVENT = {capture: true};

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

export const OrbitControls: LiveComponent<OrbitControlsProps> = (fiber) => (props) => {
  const {
    bearingSpeed = DEFAULT_OPTIONS.bearingSpeed,
    pitchSpeed   = DEFAULT_OPTIONS.pitchSpeed, 
    canvas,
    render,
  } = props;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [radius, setRadius]   = useState<number>(5);
  const [bearing, setBearing] = useState<number>(0.6);
  const [pitch, setPitch]     = useState<number>(0.4);

  useResource((dispose) => {
    const onWheel = (e: WheelEvent) => {
      const {deltaMode, deltaY} = e;
      let f = 1;
      if (deltaMode === 1) f = 10;
      if (deltaMode === 2) f = 30;
      setRadius((r: number) => r * (1 + deltaY * f / 100));
      e.preventDefault();
    };

    const onMove = (buttons: number, moveX: number, moveY: number) => {
      const size = Math.min(canvas.width, canvas.height);
      const speedX = bearingSpeed / size;
      const speedY = pitchSpeed   / size;

      if (buttons & 1) {
        if (moveX || moveY) {
          setBearing((phi: number) => phi + moveX * speedX);
          setPitch((theta: number) => clamp(theta + moveY * speedY, -π/2, π/2));
        }
        return true;
      }
    };

    let lastX: number;
    let lastY: number;
    const onTouchStart = (e: TouchEvent) => {
      // @ts-ignore
      const {targetTouches: [touch]} = e;
      lastX = touch.pageX;
      lastY = touch.pageY;
      e.preventDefault();
      e.stopPropagation();
    }

    // @ts-ignore
    const onTouchMove = (e: TouchEvent) => {
      // @ts-ignore
      const {targetTouches: [touch]} = e;
      const x = touch.pageX;
      const y = touch.pageY;
      const dx = x - lastX;
      const dy = y - lastY;
      lastX = x;
      lastY = y;

      if (onMove(1, dx, dy)) {
        e.preventDefault();
        e.stopPropagation();
      }
    }

    const onMouseMove = (e: MouseEvent) => {
      if (onMove(e.buttons, e.movementX, e.movementY)) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
    
    const onMouseDown = (e: MouseEvent) => {
      document.addEventListener('mousemove', onMouseMove, CAPTURE_EVENT);
      document.addEventListener('mouseup', onMouseUp, CAPTURE_EVENT);
    }

    const onMouseUp = (e: MouseEvent) => {
      document.removeEventListener('mousemove', onMouseMove, CAPTURE_EVENT);
      document.removeEventListener('mouseup', onMouseUp, CAPTURE_EVENT);
    }

    canvas.addEventListener("touchstart", onTouchStart, CAPTURE_EVENT);
    canvas.addEventListener("touchmove", onTouchMove, CAPTURE_EVENT);

    canvas.addEventListener("mousedown", onMouseDown, CAPTURE_EVENT);
    canvas.addEventListener('wheel', onWheel);
    dispose(() => {
      canvas.removeEventListener("touchstart", onTouchStart, CAPTURE_EVENT);
      canvas.removeEventListener("touchmove", onTouchMove, CAPTURE_EVENT);
      canvas.removeEventListener("mousedown", onMouseDown, CAPTURE_EVENT);
      canvas.removeEventListener('wheel', onWheel);
    });
  }, [canvas]);
  return render(radius, bearing, pitch);
};
