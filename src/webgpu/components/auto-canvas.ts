import type { LiveComponent, LiveElement } from '../../live';
import type { ColorSpace } from '../../core';

import { use, useResource, useNoResource } from '../../live';
import { PickingTarget } from '../../workbench';
import { CursorProvider } from '../../workbench';

import { makeOrAdoptCanvas } from '../web';
import { AutoSize } from './auto-size';
import { Canvas } from './canvas';
import { DOMEvents } from './dom-events';

export type AutoCanvasProps = {
  /** Adopt HTML canvas */
  canvas?: HTMLCanvasElement,
  /** Adopt from, or create HTML canvas in CSS selector */
  selector?: string,

  /** Color format */
  format?: GPUTextureFormat,
  /** Depth stencil format */
  depthStencil?: GPUTextureFormat,
  /** Canvas background */
  backgroundColor?: GPUColor,
  /** Canvas rendering color space */
  colorSpace?: ColorSpace,
  /** Color space for inputs */
  colorInput?: ColorSpace,
  /** Multisampling / Anti-aliasing */
  samples?: number,

  /** Autofocus keyboard on canvas */
  autofocus?: boolean,
  /** Enable DOM events */
  events?: boolean,
  /** Enable GPU picking */
  picking?: boolean,

  children?: LiveElement,
};

export const AutoCanvas: LiveComponent<AutoCanvasProps> = (props) => {
  const {
    selector,
    children,
    events = true,
    autofocus = false,
    picking = true,
    ...rest
  } = props;

  let {canvas} = props;
  if (!canvas && selector != null) {
    canvas = useResource((dispose) => {
      const [c, d] = makeOrAdoptCanvas(selector);
      dispose(d);
      return c;
    }, [selector]);
  }
  else {
    useNoResource();
  }
  if (!canvas) throw new Error(`Cannot find canvas '${selector ?? props.canvas}'`);

  let view = children;
  if (events) view = (
    use(DOMEvents, {
      autofocus,
      element: canvas,
      children:
        use(CursorProvider, {
          element: canvas,
          children: view,
        })
    })
  );

  if (picking) view = use(PickingTarget, {
    children: view,
  });

  return (
    use(AutoSize, {
      canvas,
      children: (width: number, height: number, pixelRatio: number) =>
        use(Canvas, {
          ...rest,
          width,
          height,
          pixelRatio,
          canvas,
          children: view
        })
    })
  );
}