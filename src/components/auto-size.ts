import { LiveComponent, LiveElement } from '../live/types';
import { useResource, useState } from '../live';

export type AutoSizeProps = {
  canvas: HTMLCanvasElement,
  render: (width: number, height: number) => LiveElement<any>,
}

export const getCanvasSize = (window: Window, canvas: HTMLCanvasElement): [number, number] => {
  const dpi = window.devicePixelRatio;
  const {offsetWidth, offsetHeight} = canvas;
  return [dpi * offsetWidth, dpi * offsetHeight];
}

export const AutoSize: LiveComponent<AutoSizeProps> = (fiber) => (props) => {
  const {canvas, render} = props;
  
  const [[width, height], setSize] = useState(() => getCanvasSize(window, canvas));
  if (canvas.width  !==  width) canvas.width  = width;
  if (canvas.height !== height) canvas.height = height;

  useResource((dispose) => {
    const resize = () => setSize(getCanvasSize(window, canvas))
    window.addEventListener('resize', resize);
    dispose(() => window.removeEventListener('resize', resize));
  }, [canvas]);

  return render(width, height);
};
