import { LiveComponent, LiveElement } from '../live/types';
import { CanvasRenderingContextGPU } from '../webgpu/types';

import { AutoSize } from './auto-size';
import { Canvas } from './canvas';

import { use } from '../live';

export type AutoCanvasProps = {
  device: GPUDevice,
  adapter: GPUAdapter,
  canvas: HTMLCanvasElement,

  presentationFormat?: GPUTextureFormat,
  depthStencilFormat?: GPUTextureFormat,
  backgroundColor?: GPUColor,

  render: (context: CanvasRenderingContextGPU) => LiveElement<any>,
}

export const AutoCanvas: LiveComponent<AutoCanvasProps> = () => (props) =>
  use(AutoSize)({
    canvas: props.canvas,
    children: use(Canvas)({...props}),
  });
