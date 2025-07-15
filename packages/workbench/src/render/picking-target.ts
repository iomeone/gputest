import type { LiveComponent, PropsWithChildren } from '@use-gpu/live';
import type { TypedArray, TextureSource, OffscreenRenderContext } from '@use-gpu/core';

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
  makeTargetTexture,
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
    const depthTexture = makeTargetTexture(device, width, height, 1, depthStencilFormat);

    pickingTexture.label = '<PickingTarget> Readback';
    depthTexture.label = '<PickingTarget> DepthTexture';

    const colorAttachments = [makeColorAttachment(pickingTexture, null, pickingColor)];
    const depthStencilAttachment = makeDepthStencilAttachment(depthTexture, depthStencilFormat);

    let updated = false;
    let waiting = false;
    let captured = null as TypedArray | null;

    const captureData = async () => {
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

    const samplePoint = (x: number, y: number): number[] => {
      if (!captured) return seq(itemDims).map(() => 0);

      const xs = Math.round(x * resolution);
      const ys = Math.round(y * resolution);

      const offset = (itemsPerRow * ys + xs) * itemDims;

      const index = seq(itemDims).map(i => (captured as TypedArray)[offset + i]);
      return index;
    };

    const sampleRectangle = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
    ) => {
      const xmin = Math.round(Math.min(x1, x2) * resolution);
      const ymin = Math.round(Math.min(y1, y2) * resolution);
      const xmax = Math.round(Math.max(x1, x2) * resolution);
      const ymax = Math.round(Math.max(y1, y2) * resolution);

      const seen = new Map();
      if (!captured) return seen;

      for (let ys = ymin; ys <= ymax; ++ys) {
        for (let xs = xmin; xs <= xmax; ++xs) {
          const offset = (itemsPerRow * ys + xs) * itemDims;

          let m: Set<any> | Map<number, any> = seen;
          for (let i = 0; i < itemDims; ++i) {
            const value = captured[offset + i];

            if (i === itemDims - 1) (m as Set<number>).add(value);
            else {
              let s = (m as Map<number, any>).get(value);
              if (!s) (m as Map<number, any>).set(value, s = (i === itemDims - 2 ? new Set() : new Map()));
              m = s;
            }
          }
        }
      }

      return seen;
    };

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
      hint: 'picking',
    } as TextureSource;

    const depth = {
      texture: depthTexture,
      sampler: {},
      layout: 'texture_depth_2d',
      format: depthStencilFormat,
      size: [width, height],
      version: 0,
      hint: 'depth',
    } as TextureSource;

    const context = {
      renderContext: {
        ...renderContext,

        width,
        height,
        samples,
        colorStates,

        viewAttachments: [{
          colorAttachments,
          depthStencilAttachment,
        }],

        swap,
        source,
        depth,
      } as OffscreenRenderContext,

      captureData,

      samplePoint,
      sampleRectangle,
    };

    return context;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device, renderContext, colorStates, depthStencilState, resolution]);

  return [
    provide(PickingContext, pickingContext, children),
    quote(yeet(() => {
      pickingContext.captureData();
    })),
  ];
};
