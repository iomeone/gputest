import type { LiveComponent, PropsWithChildren } from '@use-gpu/live';
import type { UseGPURenderContext, ColorSpace } from '@use-gpu/core';

import { EventProvider } from '@use-gpu/workbench';//'/event-provider';
import { RenderContext } from '@use-gpu/workbench';//'/providers/render-provider';
import { LayoutContext } from '@use-gpu/workbench';//'/providers/layout-provider';
import { DeviceContext } from '@use-gpu/workbench';//'/providers/device-provider';
import { provide, use, signal, imperative, useCallback, useContext, useMemo, useOne, useFiber } from '@use-gpu/live';
import {
  makeColorState,
  makeColorAttachment,
  makeTargetTexture,
  makeReadbackTexture,
  makeDepthTexture,
  makeDepthStencilState,
  makeDepthStencilAttachment,
  BLEND_PREMULTIPLY,
} from '@use-gpu/core';

import { DEPTH_STENCIL_FORMAT, COLOR_SPACE, BACKGROUND_COLOR } from '../constants';
import { makePresentationContext } from '../web';

export type CanvasProps = {
  canvas: HTMLCanvasElement,

  format?: GPUTextureFormat,
  depthStencil?: GPUTextureFormat,
  backgroundColor?: GPUColor,
  colorSpace?: ColorSpace,
  colorInput?: ColorSpace,
  samples?: number,
  pixelRatio?: number,
}

const getPixelRatio = () => typeof window !== 'undefined' ? window.devicePixelRatio : 1;

export const Canvas: LiveComponent<CanvasProps> = imperative((props: PropsWithChildren<CanvasProps>) => {
  const {
    canvas,
    children,
    pixelRatio = getPixelRatio(),
    format = navigator.gpu.getPreferredCanvasFormat(),
    depthStencil = DEPTH_STENCIL_FORMAT,
    backgroundColor = BACKGROUND_COLOR,
    colorSpace = COLOR_SPACE,
    colorInput = COLOR_SPACE,
    samples = 1
  } = props;

  const device = useContext(DeviceContext);

  const {width, height} = canvas;
  if (width * height === 0) return;

  const layout = useMemo(() => [0, height / pixelRatio, width / pixelRatio, 0], [width, height, pixelRatio]);

  const renderTexture = useMemo(() =>
    samples > 1
    ? makeTargetTexture(
        device,
        width,
        height,
        format,
        samples,
      )
    : null,
    [device, width, height, format, samples]
  );
  
  const colorStates      = useOne(() => [makeColorState(format, BLEND_PREMULTIPLY)], format);
  const colorAttachments = useMemo(() =>
    [makeColorAttachment(renderTexture, null, backgroundColor)],
    [backgroundColor, renderTexture]
  );
  const depthStencilState = useOne(() => makeDepthStencilState(depthStencil), depthStencil);

  const [
    depthTexture,
    depthStencilAttachment,
  ] = useMemo(() => {
      const texture = makeDepthTexture(device, width, height, depthStencil, samples);
      const attachment = makeDepthStencilAttachment(texture, depthStencil);
      return [texture, attachment];
    },
    [device, width, height, depthStencil, samples]
  );

  const gpuContext = useMemo(() =>
    makePresentationContext(device, canvas, format),
    [device, canvas, format, width, height],
  );
  
  const swap = useCallback((view?: GPUTextureView) => {
    view = view ?? gpuContext
      .getCurrentTexture()
      .createView();

    if (samples > 1) colorAttachments[0].resolveTarget = view; 
    else colorAttachments[0].view = view;
  }, [gpuContext, samples, colorAttachments])

  const renderContext = useOne(() => ({
    width,
    height,
    pixelRatio,
    samples,

    device,
    gpuContext,
    colorSpace,
    colorInput,
    colorStates,
    colorAttachments,
    depthTexture,
    depthStencilState,
    depthStencilAttachment,

    swap,
  } as UseGPURenderContext), [
    width,
    height,
    pixelRatio,
    samples,

    device,
    gpuContext,
    colorSpace,
    colorInput,
    colorStates,
    colorAttachments,
    depthTexture,
    depthStencilState,
    depthStencilAttachment,

    swap,
  ]);
  
  const fiber = useFiber();
  fiber.__inspect = fiber.__inspect ?? {};
  fiber.__inspect.canvas = {
    element: canvas,
    context: gpuContext,
    device,
    renderTexture,
  };

  return [
    signal(),
    provide(RenderContext, renderContext,
      provide(LayoutContext, layout, children)
    )
  ];
}, 'Canvas')
