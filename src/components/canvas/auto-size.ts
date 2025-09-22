import { LiveComponent, LiveElement } from '@use-gpu/live/types';
import { useResource, useState } from '@use-gpu/live';

export type AutoSizeProps = {
  canvas: HTMLCanvasElement,
  render?: (width: number, height: number) => LiveElement<any>,
  children?: LiveElement<any>,
}

export const getCanvasSize = (window: Window, canvas: HTMLCanvasElement): [number, number] => {
  const dpi = window.devicePixelRatio;
  const {offsetWidth, offsetHeight} = canvas;
  return [dpi * offsetWidth, dpi * offsetHeight];
}

export const AutoSize: LiveComponent<AutoSizeProps> = (fiber) => (props) => {
  const {canvas, render, children} = props;

  useResource(() => {
    canvas.style.position = 'absolute';
    canvas.style.left = '0';
    canvas.style.top = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
  }, [canvas]);
 
  const [[width, height], setSize] = useState(() => getCanvasSize(window, canvas));
  if (canvas.width  !==  width) canvas.width  = width;
  if (canvas.height !== height) canvas.height = height;

  useResource((dispose) => {
    const resize = () => setSize(getCanvasSize(window, canvas))
    window.addEventListener('resize', resize);
    dispose(() => window.removeEventListener('resize', resize));
  }, [canvas]);

  return render ? render(width, height) : (children ?? null);
};
