import type { LiveComponent, LiveElement } from '@use-gpu/live';

import { use, useResource, useNoResource } from '@use-gpu/live';
import { PickingTarget } from '@use-gpu/workbench';
import { CursorProvider } from '@use-gpu/workbench';

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
  /** Multisampling / Anti-aliasing */
  samples?: number,

  /** Autofocus keyboard on canvas */
  autofocus?: boolean,
  /** Enable DOM events */
  events?: boolean,
  /** Enable GPU picking */
  picking?: boolean,
  /** If running in an iframe, avoid preventing default on scroll. */
  iframe?: boolean,

  children?: LiveElement,
};

export const AutoCanvas: LiveComponent<AutoCanvasProps> = (props) => {
  const {
    selector,
    children,
    events = true,
    autofocus = false,
    picking = true,
    iframe = false,
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
      iframe,
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