import type { LiveComponent, LiveElement } from '@use-gpu/live';

import { useContext, useMemo, useOne, useResource, useState } from '@use-gpu/live';
import { MouseContext, WheelContext, KeyboardContext } from '../providers/event-provider';
import { LayoutContext } from '../providers/layout-provider';

const CAPTURE_EVENT = {capture: true};

const π = Math.PI;
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));

export type PanControlsProps = {
  x?: number,
  y?: number,
  zoom?: number,
  zoomSpeed?: number,
  anchor?: [number, number],
  active?: boolean,
  centered?: boolean,
  version?: number,

  render: (x: number, y: number, zoom: number) => LiveElement<any>,
};

const DEFAULT_ANCHOR = [0.5, 0.5];

export const PanControls: LiveComponent<PanControlsProps> = (props) => {
  const layout = useContext(LayoutContext);
  const [l, t, r, b] = layout;

  const {
    zoom: initialZoom = 1,
    x: initialX = 0,
    y: initialY = 0,
    zoomSpeed = 1/100,
    centered = true,
    active = true,
    anchor = DEFAULT_ANCHOR,
    version,
    render,
  } = props;

  const [x, setX]       = useState<number>(initialX);
  const [y, setY]       = useState<number>(initialY);
  const [zoom, setZoom] = useState<number>(initialZoom);

  let originX = 0;
  let originY = 0;
  let offsetX = 0;
  let offsetY = 0;

  if (centered) {
    const w = Math.abs(r - l);
    const h = Math.abs(b - t);
    originX = w / 2;
    originY = h / 2;
    
    offsetX = -w * (anchor[0] - 0.5);
    offsetY = -h * (anchor[1] - 0.5);
  }

  useOne(() => {
    setX(initialX);
    setY(initialY);
    setZoom(initialZoom);
  }, version);

  const { useMouse } = useContext(MouseContext);
  const { useWheel } = useContext(WheelContext);
  const { useKeyboard } = useContext(KeyboardContext);

  const { mouse } = useMouse();
  const { wheel } = useWheel();
  const { keyboard } = useKeyboard();

  useOne(() => {
    if (!active) return;

    const { moveX, moveY, buttons } = mouse;

    if (buttons.left) {
      if (moveX || moveY) {
        setX(x => x + moveX / zoom);
        setY(y => y + moveY / zoom);
      }
    }
  }, mouse);

  useOne(() => {
    if (!active) return;

    const {moveX, moveY, stop} = wheel;
    
    if (keyboard.modifiers.shift) {
      if (moveX || moveY) {
        setX(x => x - moveX / zoom);
        setY(y => y - moveY / zoom);        
      }
    }
    else if (moveY) {
      const z = zoom * (1 - moveY * zoomSpeed);
      
      const mx = mouse.x - originX;
      const my = mouse.y - originY;

      const px = (mx / zoom) - x;
      const py = (my / zoom) - y;

      const dx = (mx / z) - px;
      const dy = (my / z) - py;

      setZoom(z);
      setX(dx);
      setY(dy);
    }

    stop();
  }, wheel);

  const panX = centered ? x - originX * (zoom - 1) / zoom + offsetX : x;
  const panY = centered ? y - originY * (zoom - 1) / zoom + offsetY : y;

  return useMemo(() => render(panX, panY, zoom), [render, panX, panY, zoom]);
};
