import { LiveComponent, LiveElement } from '@use-gpu/live/types';
import { ShaderLanguages } from '@use-gpu/core/types';
import { CanvasRenderingContextGPU } from '@use-gpu/webgpu/types';

import { AutoSize } from './auto-size';
import { Canvas } from './canvas';
import { CursorConsumer } from '../consumers/cursor-consumer';

import { use } from '@use-gpu/live';

export type AutoCanvasProps = {
  device: GPUDevice,
  adapter: GPUAdapter,
  canvas: HTMLCanvasElement,
  languages: ShaderLanguages,

  presentationFormat?: GPUTextureFormat,
  depthStencilFormat?: GPUTextureFormat,
  backgroundColor?: GPUColor,
  samples?: number,

  render: (context: CanvasRenderingContextGPU) => LiveElement<any>,
}

export const AutoCanvas: LiveComponent<AutoCanvasProps> = (props) =>
  use(AutoSize)({
    canvas: props.canvas,
    children: use(CursorConsumer)({
      element: props.canvas,
      children: use(Canvas)({...props}),
    })
  });
