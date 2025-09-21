import { LiveComponent, LiveElement } from '../live/types';
import { CanvasRenderingContextGPU } from '../webgpu/types';

import { AutoSize } from './auto-size';
import { Canvas } from './canvas';

import { defer } from '../live';

export type AutoCanvasProps = {
  device: GPUDevice,
  adapter: GPUAdapter,
  canvas: HTMLCanvasElement,

  swapChainFormat?: GPUTextureFormat,
  depthStencilFormat?: GPUTextureFormat,
  backgroundColor?: GPUColor,

  render: (context: CanvasRenderingContextGPU) => LiveElement<any>,
}

export const AutoCanvas: LiveComponent<AutoCanvasProps> = () => (props) =>
  defer(AutoSize)({
    canvas: props.canvas,
    render: () => defer(Canvas)(props)
  });
