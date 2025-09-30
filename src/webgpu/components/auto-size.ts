import type { LiveComponent, LiveElement, PropsWithChildren } from '@use-gpu/live';
import { useOne, useResource, useState } from '@use-gpu/live';
import { getRenderFunc } from '@use-gpu/workbench';

export type AutoSizeProps = {
  canvas: HTMLCanvasElement,
  render?: (width: number, height: number, pixelRatio: number) => LiveElement,
  children?: (width: number, height: number, pixelRatio: number) => LiveElement,
};

const getCanvasSize = (window: Window, canvas: HTMLCanvasElement): [number, number, number] => {
  const pixelRatio = window?.devicePixelRatio ?? 1;
  const {parentElement} = canvas;
  if (parentElement) {
    const {offsetWidth, offsetHeight} = parentElement;
    return [pixelRatio * offsetWidth, pixelRatio * offsetHeight, pixelRatio];
  }
  return [pixelRatio * window.innerWidth, pixelRatio * window.innerHeight, pixelRatio];
}

export const AutoSize: LiveComponent<AutoSizeProps> = (props: AutoSizeProps) => {
  const {canvas, children} = props;

  useResource(() => {
    canvas.style.position = 'absolute';
    canvas.style.left = '0';
    canvas.style.top = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
  }, [canvas]);

  const [size, setSize] = useState(() => getCanvasSize(window, canvas));

  const [width, height, pixelRatio] = size;
  const w = Math.round(width);
  const h = Math.round(height);

  useOne(() => canvas.width = w, w);
  useOne(() => canvas.height = h, h);
  useOne(() => canvas.style.width = `${Math.round(width / pixelRatio)}px`, width);
  useOne(() => canvas.style.height = `${Math.round(height / pixelRatio)}px`, height);

  useResource((dispose) => {
    const resize = () => {
      setSize(state => {
        const size = getCanvasSize(window, canvas);
        if (state.every((s, i) => s === size[i])) return state;
        return size;
      });
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas.parentElement as any);
    window.addEventListener('resize', resize);

    dispose(() => {
      observer.disconnect();
      window.removeEventListener('resize', resize);
    });
  }, [canvas]);

  const render = getRenderFunc(props);
  return render ? render(w, h, pixelRatio) : (children ?? null);
};
