import type { LiveComponent, PropsWithChildren } from '@use-gpu/live';
import type { UseGPURenderContext, ColorSpace, TextureSource } from '@use-gpu/core';

import { RenderContext, LayoutContext, DeviceContext } from '@use-gpu/workbench';
import { provide, use, useCallback, useContext, useMemo, useOne, useRef, incrementVersion } from '@use-gpu/live';
import {
  makeColorState,
  makeColorAttachment,
  makeTargetTexture,
  makeDepthTexture,
  makeDepthStencilState,
  makeDepthStencilAttachment,
  BLEND_PREMULTIPLY,
} from '@use-gpu/core';

import { Loop, useInspectable } from '@use-gpu/workbench';

import { DEPTH_STENCIL_FORMAT, COLOR_SPACE, BACKGROUND_COLOR } from '../constants';
import { makePresentationContext } from '../web';

//const {signal} = QueueReconciler;

export type CanvasProps = PropsWithChildren<{
  canvas: HTMLCanvasElement,

  format?: GPUTextureFormat,
  depthStencil?: GPUTextureFormat,
  backgroundColor?: GPUColor,
  colorSpace?: ColorSpace,
  colorInput?: ColorSpace,
  samples?: number,

  width: number,
  height: number,
  pixelRatio?: number,
}>;

export const Canvas: LiveComponent<CanvasProps> = (props: CanvasProps) => {
  const {
    width,
    height,
    pixelRatio = 1,
    canvas,
    children,
    format = navigator.gpu.getPreferredCanvasFormat(),
    depthStencil = DEPTH_STENCIL_FORMAT,
    backgroundColor = BACKGROUND_COLOR,
    colorSpace = COLOR_SPACE,
    colorInput = COLOR_SPACE,
    samples = 1,
  } = props;

  const device = useContext(DeviceContext);

  if (width * height === 0) return;

  const layout = useMemo(() => [0, height / pixelRatio, width / pixelRatio, 0], [width, height, pixelRatio]);

  // Counters for labels
  const countRef = useRef({
    texture: 0,
    swap: 0,
  });

  const renderTexture = useMemo(() => {
    const {current: count} = countRef;
    count.texture++;
    count.swap = 0;

    const texture = (
      samples > 1
      ? makeTargetTexture(
          device,
          width,
          height,
          format,
          samples,
        )
      : null
    );
    if (texture) texture.label = `<Canvas> RenderTarget ${count.texture}`;
    return texture;
  }, [device, width, height, format, samples]);

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
    const {current: count} = countRef;

    const texture = makeDepthTexture(device, width, height, depthStencil, samples);
    texture.label = `<Canvas> DepthTarget ${count.texture}`;

    const attachment = makeDepthStencilAttachment(texture, depthStencil);
    return [texture, attachment];
  }, [device, width, height, depthStencil, samples]);

  const gpuContext = useMemo(
    () => makePresentationContext(device, canvas, format),
    [device, canvas, format, width, height],
  );

  const depth = useMemo(() => ({
    texture: depthTexture,
    sampler: {},
    layout: samples > 1 ? 'texture_depth_multisampled_2d' : 'texture_depth_2d',
    format: depthStencil,
    size: [width, height],
    version: 0,
  } as TextureSource), [depthTexture, depthStencil, samples, width, height]);

  const swap = useCallback((view?: GPUTextureView) => {
    const {current: count} = countRef;
    count.swap = incrementVersion(count.swap);
    depth.version = incrementVersion(depth.version);

    const v = view ?? gpuContext
      .getCurrentTexture()
      .createView();
    if (!view) v.label = `<Canvas> Swap View ${count.texture} / ${count.swap}`;

    if (samples > 1) colorAttachments[0].resolveTarget = v;
    else colorAttachments[0].view = v;
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
    depth,
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
    depth,
  ]);

  const inspect = useInspectable();
  inspect({
    canvas: {
      element: canvas,
      context: gpuContext,
      device,
      renderTexture,
    },
    depth,
  });

  return [
    provide(RenderContext, renderContext,
      provide(LayoutContext, layout,
        // Wrap everything in a paint-flushing loop so that canvas resize is processed in one pass
        use(Loop, {
          children
        })
      )
    )
  ];
};
