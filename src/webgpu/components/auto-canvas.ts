import type { LiveComponent, LiveElement } from '@use-gpu/live';

import { use, useResource, useNoResource } from '@use-gpu/live';
import { PickingTarget } from '@use-gpu/workbench';
import { CursorProvider } from '@use-gpu/workbench';

import { makeOrAdoptCanvas } from '../web';
import { AutoSize } from './auto-size';
import { Canvas } from './canvas';
import { DOMEvents } from './dom-events';

export type AutoCanvasProps = {
  canvas?: HTMLCanvasElement,
  selector?: string,

  format?: GPUTextureFormat,
  depthStencil?: GPUTextureFormat,
  backgroundColor?: GPUColor,
  samples?: number,

  autofocus?: boolean,
  picking?: boolean,
  iframe?: boolean,
  children: LiveElement,
}

export const AutoCanvas: LiveComponent<AutoCanvasProps> = (props) => {
  const {
    selector,
    children,
    autofocus = false,
    picking = true,
    iframe = false,
    ...rest
  } = props;

  let {canvas} = props;
  if (!canvas && props.selector) {
    canvas = useResource((dispose) => {
      const [c, d] = makeOrAdoptCanvas(props.selector!);
      dispose(d);
      return c;
    }, [props.selector]);
  }
  else {
    useNoResource();
  }
  if (!canvas) throw new Error(`Cannot find canvas '${props.selector ?? props.canvas}'`);

  const view = (
    use(DOMEvents, {
      autofocus,
      iframe,
      element: canvas,
      children:
        use(CursorProvider, {
          element: canvas,
          children,
        })
    })
  );

  return (
    use(AutoSize, {
      canvas,
      children:
        use(Canvas, {
          ...rest,
          canvas,
          children:
            picking
            ? use(PickingTarget, {
                children: view,
              })
            : view
        })
    })
  );
}