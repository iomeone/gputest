import type { LiveComponent, PropsWithChildren } from '@use-gpu/live';
import type { TypedArray, TextureSource, OffscreenTarget } from '@use-gpu/core';

import {
  PICKING_FORMAT,
  PICKING_COLOR,
  DEPTH_STENCIL_FORMAT,
} from '../constants';

import { DeviceContext } from '../providers/device-provider';
import { RenderContext } from '../providers/render-provider';
import { PickingContext } from '../providers/picking-provider';
import {
  provide, yeet,
  useMemo, useOne,
  useContext, incrementVersion,
} from '@use-gpu/live';
import {
  makeColorState,
  makeColorAttachment,
  makeReadbackTexture,
  makeDepthTexture,
  makeDepthStencilState,
  makeDepthStencilAttachment,
  makeTextureReadbackBuffer,
  TEXTURE_ARRAY_TYPES,
  seq,
} from '@use-gpu/core';

import { QueueReconciler } from '../reconcilers/index';

const {quote} = QueueReconciler;

export type PickingProps = PropsWithChildren<{
  pickingFormat?: GPUTextureFormat,
  pickingColor?: GPUColor,
  depthStencilFormat?: GPUTextureFormat,
  resolution?: number,
}>;

const DEBUG = false;

/** Global picking provider. Provides a screen-sized render target that contains object ID + item index. */
export const PickingTarget: LiveComponent<PickingProps> = (props: PickingProps) => {
  const device = useContext(DeviceContext);
  const renderContext = useContext(RenderContext);

  const {
    pickingFormat = PICKING_FORMAT,
    pickingColor = PICKING_COLOR,
    depthStencilFormat = DEPTH_STENCIL_FORMAT,
    resolution = 1/2,

    children,
  } = props;

  const colorStates = useMemo(() => [
    makeColorState(pickingFormat),
  ], [pickingFormat]);
  const depthStencilState = useOne(() =>
    makeDepthStencilState(depthStencilFormat),
    depthStencilFormat
  );

  const pickingContext = useMemo(() => {
    const {width: w, height: h, pixelRatio: dpi} = renderContext;
    const width = Math.round(w * resolution / dpi);
    const height = Math.round(h * resolution / dpi);
    const samples = 1;

    const [pickingBuffer, bytesPerRow, itemsPerRow, itemDims] = makeTextureReadbackBuffer(device, width, height, pickingFormat);
    const pickingTexture = makeReadbackTexture(device, width, height, pickingFormat);
    const depthTexture = makeDepthTexture(device, width, height, depthStencilFormat);

    pickingTexture.label = '<PickingTarget> Readback';
    depthTexture.label = '<PickingTarget> DepthTexture';

    const colorAttachments = [makeColorAttachment(pickingTexture, null, pickingColor)];
    const depthStencilAttachment = makeDepthStencilAttachment(depthTexture, depthStencilFormat);

    let updated = false;
    let waiting = false;
    let captured = null as TypedArray | null;
    const captureTexture = async () => {
      DEBUG && console.log('captureTexture', {waiting, updated})
      if (waiting) return;
      if (!updated) {
        if (captured) captured = null;
        return;
      }

      const commandEncoder = device.createCommandEncoder();
      commandEncoder.copyTextureToBuffer(
        {texture: pickingTexture},
        {buffer: pickingBuffer, bytesPerRow},
        {width, height}
      );
      device.queue.submit([commandEncoder.finish()]);

      waiting = true;
      await pickingBuffer.mapAsync(GPUMapMode.READ);

      const ArrayType = TEXTURE_ARRAY_TYPES[pickingFormat];
      if (ArrayType) {
        const array = new ArrayType(pickingBuffer.getMappedRange());
        captured = array.slice();
        DEBUG && console.log('captured texture', captured);
      }

      pickingBuffer.unmap();
      waiting = false;
      updated = false;
    }

    const swap = () => {
      updated = true;
      source.version = incrementVersion(source.version);
      depth.version = incrementVersion(depth.version);
    };

    const sampleTexture = (x: number, y: number): number[] => {
      if (!captured) return seq(itemDims).map(() => 0);

      const xs = Math.round(x * resolution / dpi);
      const ys = Math.round(y * resolution / dpi);

      const offset = (itemsPerRow * ys + xs) * itemDims;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const index = seq(itemDims).map(i => captured![offset + i]);
      return index;
    }

    const source = {
      texture: pickingTexture,
      sampler: null,
      layout: 'texture_2d<u32>',
      variant: 'textureLoad',
      format: pickingFormat,
      size: [width, height],
      colorSpace: 'picking',
      version: 0,
      id: Math.floor(Math.random() * 1000),
    } as TextureSource;

    const depth = {
      texture: depthTexture,
      sampler: {},
      layout: 'texture_depth_2d',
      format: depthStencilFormat,
      size: [width, height],
      version: 0,
    } as TextureSource;

    const context = {
      renderContext: {
        ...renderContext,
        width,
        height,
        samples,
        colorStates,
        colorAttachments,
        depthStencilAttachment,
        swap,
        source,
        depth,
      } as OffscreenTarget,
      captureTexture,
      sampleTexture,
    };

    return context;
  }, [device, renderContext, colorStates, depthStencilState, resolution]);

  return [
    provide(PickingContext, pickingContext, children),
    quote(yeet(() => {
      pickingContext.captureTexture();
    })),
  ];
};
