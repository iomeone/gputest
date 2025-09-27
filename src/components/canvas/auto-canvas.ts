import { LiveComponent, LiveElement } from '@use-gpu/live/types';
import { CanvasRenderingContextGPU } from '@use-gpu/webgpu/types';

import { AutoSize } from './auto-size';
import { Canvas } from './canvas';
import { CanvasPicking } from './canvas-picking';
import { CursorConsumer } from '../consumers/cursor-consumer';

import { use } from '@use-gpu/live';

export type AutoCanvasProps = {
  device: GPUDevice,
  adapter: GPUAdapter,
  canvas: HTMLCanvasElement,

  format?: GPUTextureFormat,
  depthStencil?: GPUTextureFormat,
  backgroundColor?: GPUColor,
  samples?: number,

  children: LiveElement<any>,
}

export const AutoCanvas: LiveComponent<AutoCanvasProps> = (props) => {
  const {children, ...rest} = props;
  const {canvas} = props;

  return (
    use(AutoSize, {
      canvas,
      children:
        use(Canvas, {
          ...rest,
          children:
            use(CanvasPicking, {
              canvas,
              children:
                use(CursorConsumer, {
                  element: canvas,
                  children,
                })
            })
        })
    })
  );
}