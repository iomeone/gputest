import { LiveComponent, LiveElement } from '@use-gpu/live/types';
import { CanvasRenderingContextGPU } from '@use-gpu/webgpu/types';

import { AutoSize } from './auto-size';
import { Canvas } from './canvas';
import { CanvasPicking } from './canvas-picking';
import { CursorConsumer } from '../consumers/cursor-consumer';

import { use, useResource, useNoResource } from '@use-gpu/live';
import { adoptCanvas } from '@use-gpu/webgpu';

export type AutoCanvasProps = {
  canvas?: HTMLCanvasElement,
  selector?: string,

  format?: GPUTextureFormat,
  depthStencil?: GPUTextureFormat,
  backgroundColor?: GPUColor,
  samples?: number,

  picking?: boolean,
  children: LiveElement<any>,
}

export const AutoCanvas: LiveComponent<AutoCanvasProps> = (props) => {
  const {
    selector,
    children,
    picking = true,
    ...rest
  } = props;

  let {canvas} = props;
  if (!canvas && props.selector) {
    canvas = useResource((dispose) => {
      const [c, d] = adoptCanvas(props.selector);
      dispose(d);
      return c;
    }, [props.selector]);
  }
  else {
    useNoResource();
  }
  if (!canvas) throw new Error(`Cannot find canvas '${props.selector ?? props.canvas}'`);

  const view = (
    use(CursorConsumer, {
      element: canvas,
      children,
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
            ? use(CanvasPicking, {
                canvas,
                children: view,
              })
            : view
        })
    })
  );
}