import type { LiveComponent } from '@use-gpu/live';

import { useTimeContext } from '@use-gpu/workbench';
import { memo, useOne, useResource } from '@use-gpu/live';

export type FPSCounterProps = {
  container?: Element | string | null,

  left?: number,
  top?: number,
  width?: number,
  height?: number,
  samples?: number,

  pad?: number,
  font?: number,
};

export const FPSCounter: LiveComponent<FPSCounterProps> = memo((props: FPSCounterProps) => {
  const {
    container,

    pad = 5,
    font = 14,
    left = 0,
    top = 0,
    width = 200,
    height = 100,
    samples = 100,
  } = props;

  const time = useTimeContext();
  
  const values: number[] = useOne(() => []);
  if (time.delta) values.push(1000 / time.delta);
  if (values.length > samples) values.shift();

  const [canvas, dpi, w, h, p] = useResource((dispose) => {
    const parent = typeof container === 'string' ? document.querySelector(container) : container;
    if (!parent) throw new Error(`Cannot find parent element '${container}'`);

    const wp = width + pad*2;
    const hp = height + pad*2;

    const canvas = document.createElement('canvas');
    const {devicePixelRatio: dpi} = window;
    canvas.width = wp * dpi;
    canvas.height = hp * dpi;
    canvas.style.left = `${left}px`;
    canvas.style.top = `${top}px`;
    canvas.style.width = `${wp}px`;
    canvas.style.height = `${hp}px`;
    canvas.style.position = 'absolute';

    parent.appendChild(canvas);

    dispose(() => parent.removeChild(canvas));

    return [canvas, dpi, width, height, pad];
  }, [container]);

  const context = canvas.getContext('2d');
  if (!context) return;

  context.resetTransform();
  context.scale(dpi, dpi);
  context.fillStyle = '#400000';
  context.fillRect(0, 0, w+p*2, h+p*2);

  const max = values.reduce((a, b) => Math.max(a, b), -Infinity);
  const avg = 1000 / (values.reduce((a, b) => a + 1000 / b, 0) / (values.length || 1));

  const xs = width / samples;
  const skip = samples - values.length;

  const line = font + 4;
  const hh = h - line;

  const toHex = (f: number) => ('0' + ((f * 255) | 0).toString(16)).slice(-2);

  const toColor = (f: number) => {
    const t = Math.max(0, f - 0.95) / 0.05;
    const r = 1;
    const g = t;
    const b = t;
    return '#' + toHex(r) + toHex(g) + toHex(b);
  };

  for (let i = 0; i < values.length; ++i) {
    const x = (skip + i) * xs;
    const f = values[i] / max;
    const v = f * hh;
    context.fillStyle = toColor(f);
    context.fillRect(x + p, line + hh - v + p, xs, v);
  }

  if (1/avg != 0) {
    const text = `${(avg).toFixed(1)} fps - ${(1000 / avg).toFixed(1)}ms`;
    context.fillStyle = '#c0c0c0';
    context.font = `bold ${font}px sans-serif`;
    context.fillText(text, p, p + font - 2);
  }
}, 'FPSCounter');
