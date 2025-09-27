import type { LiveComponent, LiveElement } from '@use-gpu/live';
import { useResource, useState } from '@use-gpu/live';

export type AutoSizeProps = {
  canvas: HTMLCanvasElement,
  render?: (width: number, height: number, pixelRatio: number) => LiveElement<any>,
  children?: LiveElement<any>,
}

const getCanvasSize = (window: Window, canvas: HTMLCanvasElement): [number, number, number] => {
  const pixelRatio = window?.devicePixelRatio ?? 1;
  const {parentNode} = canvas;
  if (parentNode) {
    const {offsetWidth, offsetHeight} = parentNode as any;
    return [pixelRatio * offsetWidth, pixelRatio * offsetHeight, pixelRatio];
  }
  return [pixelRatio * window.innerWidth, pixelRatio * window.innerHeight, pixelRatio];
}

export const AutoSize: LiveComponent<AutoSizeProps> = (props) => {
  const {canvas, render, children} = props;

  useResource(() => {
    canvas.style.position = 'absolute';
    canvas.style.left = '0';
    canvas.style.top = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
  }, [canvas]);
 
  const [[width, height, pixelRatio], setSize] = useState(() => getCanvasSize(window, canvas));
  if (canvas.width  !==  width) {
    canvas.width  = width;
    canvas.style.width = `${width / pixelRatio}px`;
  }
  if (canvas.height !== height) {
    canvas.height = height;
    canvas.style.height = `${height / pixelRatio}px`;
  }

  useResource((dispose) => {
    const resize = () => setSize(getCanvasSize(window, canvas));

    const observer = new ResizeObserver(resize);
    observer.observe(canvas.parentElement as any);
    window.addEventListener('resize', resize);

    dispose(() => {
      observer.disconnect();
      window.removeEventListener('resize', resize);
    });
  }, [canvas]);

  return render ? render(width, height, pixelRatio) : (children ?? null);
};
