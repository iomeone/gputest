import type { LiveComponent, LiveElement } from '@use-gpu/live';

import { useContext, useMemo, useOne, useResource, useState, useYolo } from '@use-gpu/live';
import { MouseContext, WheelContext, KeyboardContext } from '../providers/event-provider';
import { LayoutContext } from '../providers/layout-provider';

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

  minX?: number,
  maxX?: number,
  minY?: number,
  maxY?: number,
  minZoom?: number,
  maxZoom?: number,

  render: (x: number, y: number, zoom: number) => LiveElement,
};

const DEFAULT_ANCHOR = [0.5, 0.5];

export const PanControls: LiveComponent<PanControlsProps> = (props) => {
  const layout = useContext(LayoutContext);
  const [l, t, r, b] = layout;

  const {
    zoom: initialZoom = 1,
    x: initialX = 0,
    y: initialY = 0,
    zoomSpeed = 1/80,
    centered = true,

    minX,
    maxX,
    minY,
    maxY,
    minZoom,
    maxZoom,

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
  
  const { useMouse } = useContext(MouseContext);
  const { useWheel } = useContext(WheelContext);
  const { useKeyboard } = useContext(KeyboardContext);

  const { mouse } = useMouse();
  const { wheel } = useWheel();
  const { keyboard } = useKeyboard();

  let reset = false;
  useOne(() => {
    reset = keyboard.modifiers.alt && keyboard.keys.enter;
  }, keyboard);

  useOne(() => {
    setX(initialX);
    setY(initialY);
    setZoom(initialZoom);
  }, reset || version);

  useOne(() => {
    setX(initialX);
  }, initialX);

  useOne(() => {
    setY(initialY);
  }, initialY);

  useOne(() => {
    setZoom(initialZoom);
  }, initialZoom);

  useOne(() => {
    const { moveX, moveY, buttons, stopped } = mouse;
    if (!active || stopped) return;

    if (buttons.left) {
      if (moveX || moveY) {
        setX(x => {
          x += moveX / zoom;
          if (minX != null) x = Math.max(minX, x);
          if (maxX != null) x = Math.min(maxX, x);
          return x;
        });
        setY(y => {
          y += moveY / zoom;
          if (minY != null) y = Math.max(minY, y);
          if (maxY != null) y = Math.min(maxY, y);
          return y;
        });
      }
    }
  }, mouse);

  useOne(() => {
    const {moveX, moveY, stop, stopped} = wheel;
    if (!active || stopped) return;
    
    if (keyboard.modifiers.shift) {
      if (moveX || moveY) {
        setX(x => {
          x -= moveX / zoom;
          if (minX != null) x = Math.max(minX, x);
          if (maxX != null) x = Math.min(maxX, x);
          return x;
        });
        setY(y => {
          y -= moveY / zoom;
          if (minY != null) y = Math.max(minY, y);
          if (maxY != null) y = Math.min(maxY, y);
          return y;
        });
      }
    }
    else if (moveY) {
      let z = zoom * Math.pow(2, -moveY * zoomSpeed);

      if (minZoom != null) z = Math.max(minZoom, z);
      if (maxZoom != null) z = Math.min(maxZoom, z);

      if (z !== zoom) {
        const mx = mouse.x - originX;
        const my = mouse.y - originY;

        const px = (mx / zoom) - x;
        const py = (my / zoom) - y;

        let dx = (mx / z) - px;
        let dy = (my / z) - py;

        if (minX != null) dx = Math.max(minX, dx);
        if (maxX != null) dx = Math.min(maxX, dx);

        if (minY != null) dy = Math.max(minY, dy);
        if (maxY != null) dy = Math.min(maxY, dy);

        setZoom(z);
        setX(dx);
        setY(dy);
      }
    }

    stop();
  }, wheel);

  const panX = centered ? x - originX * (zoom - 1) / zoom + offsetX : x;
  const panY = centered ? y - originY * (zoom - 1) / zoom + offsetY : y;

  return useYolo(() => render(panX, panY, zoom), [render, panX, panY, zoom]);
};
