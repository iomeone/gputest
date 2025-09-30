import type { LiveComponent, LiveElement } from '@use-gpu/live';

import { lerp } from '@use-gpu/core';
import { use, useCallback, useContext, useHooks, useOne, useRef, useState } from '@use-gpu/live';
import { useMouse, useWheel, useKeyboard } from '../providers/event-provider';
import { useAnimationFrame, useNoAnimationFrame } from '../providers/loop-provider';
import { usePerFrame, useNoPerFrame } from '../providers/frame-provider';
import { LayoutContext } from '../providers/layout-provider';
import { getRenderFunc } from '../hooks/useRenderProp';

const SOFT_LERP = 0.35;
const EASE_LERP = 0.05;
const SNAP_WAIT = 66;

const identity = (x: number) => x;

export type PanControlsProps = {
  x?: number,
  y?: number,
  zoom?: number,
  zoomSpeed?: number,
  anchor?: [number, number],
  scroll?: boolean,
  active?: boolean,
  centered?: boolean,
  version?: number,

  soft?: boolean,
  minX?: number,
  maxX?: number,
  minY?: number,
  maxY?: number,
  minZoom?: number,
  maxZoom?: number,
  snapZoom?: number,

  render?: (x: number, y: number, zoom: number, ox: number, oy: number) => LiveElement,
  children?: (x: number, y: number, zoom: number, ox: number, oy: number) => LiveElement,
};

const DEFAULT_ANCHOR = [0.5, 0.5];

export const PanControls: LiveComponent<PanControlsProps> = (props) => {
  const layout = useContext(LayoutContext);
  const [l, t, r, b] = layout;

  const {
    zoom: initialZoom = 1,
    x: initialX = 0,
    y: initialY = 0,
    zoomSpeed = 1/120,
    centered = true,

    minX = null,
    maxX = null,
    minY = null,
    maxY = null,
    minZoom = null,
    maxZoom = null,
    snapZoom = null,

    soft = false,
    scroll = false,
    active = true,
    anchor = DEFAULT_ANCHOR,
    version,
  } = props;

  // eslint-disable-next-line prefer-const
  let [x, setX]       = useState<number>(initialX);
  // eslint-disable-next-line prefer-const
  let [y, setY]       = useState<number>(initialY);
  // eslint-disable-next-line prefer-const
  let [zoom, setZoom] = useState<number>(initialZoom);

  let originX = 0;
  let originY = 0;
  let offsetX = 0;
  let offsetY = 0;

  const w = Math.abs(r - l);
  const h = Math.abs(b - t);
  if (centered) {
    originX = w / 2;
    originY = h / 2;

    offsetX = -w * (anchor[0] - 0.5);
    offsetY = -h * (anchor[1] - 0.5);
  }

  const { mouse } = useMouse();
  const { wheel, stop: stopWheel } = useWheel();
  const { keyboard } = useKeyboard();

  const now = +new Date();
  const lastZoomRef = useRef(now);

  let reset = false;
  useOne(() => {
    reset = !!(keyboard.modifiers.alt && keyboard.keys.enter);
  }, keyboard);

  useOne(() => {
    setX(initialX);
    setY(initialY);
    setZoom(initialZoom);
    lastZoomRef.current = now;
  }, reset);

  useOne(() => {
    setX(initialX);
    lastZoomRef.current = now;
  }, version ?? initialX);

  useOne(() => {
    setY(initialY);
    lastZoomRef.current = now;
  }, version ?? initialY);

  useOne(() => {
    setZoom(initialZoom);
    lastZoomRef.current = now;
  }, version ?? initialZoom);

  const clampX = useCallback((x: number, zoom: number, factor: number = 0) => {
    const xx = x;

    const [minXZ, maxXZ] = adjustRange(minX, maxX, zoom, w);
    if (minXZ != null) x = -Math.max(minXZ, -x);
    if (maxXZ != null) x = -Math.min(maxXZ, -x);

    return factor ? lerp(xx, x, factor) : x;
  }, [minX, maxX, w]);

  const clampY = useCallback((y: number, zoom: number, factor: number = 0) => {
    const yy = y;

    const [minYZ, maxYZ] = adjustRange(minY, maxY, zoom, h);
    if (minYZ != null) y = -Math.max(minYZ, -y);
    if (maxYZ != null) y = -Math.min(maxYZ, -y);

    return factor ? lerp(yy, y, factor) : y;
  }, [minY, maxY, h]);

  const clampZ = useCallback((z: number, factor: number = 0) => {
    const zz = z;

    if (minZoom != null) z = Math.max(minZoom, z);
    if (maxZoom != null) z = Math.min(maxZoom, z);

    return factor ? lerp(zz, z, factor) : z;
  }, [minZoom, maxZoom]);

  const EPS = 1e-3 / zoom;
  const outOfBoundsX = Math.abs(clampX(x, zoom) - x) > EPS;
  const outOfBoundsY = Math.abs(clampY(y, zoom) - y) > EPS;
  const outOfBoundsZ = Math.abs(clampZ(zoom) - zoom) > EPS;
  const outOfBounds = outOfBoundsX || outOfBoundsY || outOfBoundsZ;

  const unitSnap = Math.min(zoom, 1/zoom);
  const nearUnitSnap = snapZoom && (unitSnap > 1 - snapZoom && unitSnap < 0.999);
  const needsAnimation = outOfBounds || nearUnitSnap;

  let delta = 0;
  if (soft && needsAnimation) {
    ({delta} = useAnimationFrame());
  }
  else useNoAnimationFrame();

  const [minXZ, maxXZ] = adjustRange(minX, maxX, zoom, w);
  const [minYZ, maxYZ] = adjustRange(minY, maxY, zoom, h);

  const onEdgeX = !outOfBounds && Math.min(
    minXZ != null ? Math.abs(x - minXZ) : Infinity,
    maxXZ != null ? Math.abs(x - maxXZ) : Infinity
  ) < 1/100;
  const onEdgeY = !outOfBounds && Math.min(
    minYZ != null ? Math.abs(y - minYZ) : Infinity,
    maxYZ != null ? Math.abs(y - maxYZ) : Infinity
  ) < 1/100;
  const onEdgeZ = !outOfBounds && Math.min(
    minZoom != null ? Math.abs(zoom - minZoom) / minZoom : Infinity,
    maxZoom != null ? Math.abs(zoom - maxZoom) / maxZoom : Infinity
  ) < 1/100;

  const limitX = (!onEdgeX && soft) && !(minXZ != null && maxXZ != null && Math.abs(minXZ - maxXZ) < 1/zoom && !outOfBoundsX) ? identity : clampX;
  const limitY = (!onEdgeY && soft) && !(minYZ != null && maxYZ != null && Math.abs(minYZ - maxYZ) < 1/zoom && !outOfBoundsY) ? identity : clampY;
  const limitZ = (!onEdgeZ && soft && !outOfBoundsZ) ? identity : clampZ;

  const frame = soft ? usePerFrame() : useNoPerFrame();
  useOne(() => {
    if (!active || !soft) return;

    if (outOfBounds) {
      const factor = Math.pow(SOFT_LERP, delta / (1000/60));
      setZoom(zoom = clampZ(zoom, factor));
      setX(x = clampX(x, zoom, factor));
      setY(y = clampY(y, zoom, factor));
    }
    else if (nearUnitSnap) {
      const snapTime = now - lastZoomRef.current;
      if (snapTime > SNAP_WAIT) {
        const factor = Math.pow(EASE_LERP, delta / (1000/60));
        setZoom(zoom = lerp(zoom, 1, factor));
      }
    }
  }, frame);

  useOne(() => {
    const { moveX, moveY, buttons, stopped } = mouse;
    if (!active || stopped) return;

    if (buttons.left) {
      if (moveX || moveY) {
        setX(x => limitX(x + moveX / zoom, zoom));
        setY(y => limitY(y + moveY / zoom, zoom));
      }
    }
  }, mouse);

  useOne(() => {
    const {moveX, moveY, stopped} = wheel;
    if (!active || stopped) return;

    if (!!scroll !== (keyboard.modifiers.shift || keyboard.modifiers.alt)) {
      if (moveX || moveY) {
        setX(x => limitX(x - moveX / zoom, zoom));
        setY(y => limitY(y - moveY / zoom, zoom));
      }
    }
    else if (moveY) {
      const z = limitZ(zoom * Math.pow(2, -moveY * zoomSpeed));

      if (z !== zoom) {
        const mx = mouse.x - originX;
        const my = mouse.y - originY;
        lastZoomRef.current = now;

        setZoom(z);
        setX(x => {
          const px = (mx / zoom) - x;
          const xx = (mx / z) - px;
          return limitX(xx, z);
        });
        setY(y => {
          const py = (my / zoom) - y;
          const yy = (my / z) - py;
          return limitY(yy, z);
        });
      }
    }

    stopWheel();
  }, wheel);

  const panX = centered ? x - originX * (zoom - 1) / zoom + offsetX : x;
  const panY = centered ? y - originY * (zoom - 1) / zoom + offsetY : y;

  const render = getRenderFunc(props);
  return useHooks(() => render ? render(panX, panY, zoom, x, y) : null, [panX, panY, zoom, x, y, render]);
};

const adjustRange = (a: number | null, b: number | null, zoom: number, size: number) => {
  let min = a != null ? a - size * (zoom - 1) / zoom / 2 : null;
  let max = b != null ? b - size * (zoom + 1) / zoom / 2 : null;
  if (min != null && max != null && min > max) min = max = (min + max) / 2;
  return [min, max];
};
