import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { TypedArray, UniformAttribute, TextureSource, UseRenderingContextGPU } from '@use-gpu/core';

import {
  PICKING_FORMAT,
  PICKING_COLOR,
  DEPTH_STENCIL_FORMAT,
} from '../constants';

import { DeviceContext, RenderContext } from '../providers';
import {
  memo, use, provide, makeContext,
  useMemo, useOne, useNoOne, useResource,
  useContext, useNoContext,
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
  TEXTURE_FORMAT_SIZES,
  PICKING_UNIFORMS,
} from '@use-gpu/core';

const seq = (n: number, s: number = 0, d: number = 1) => Array.from({ length: n }).map((_, i: number) => s + d * i);

type OnPick = (index: number) => void;

export type PickingContextProps = {
  renderContext: UseRenderingContextGPU,
  pickingTexture: GPUTexture,
  pickingSource: TextureSource,
  captureTexture: () => void,
  sampleTexture: (x: number, y: number) => number[],
};

export const PickingContext = makeContext<PickingContextProps>(null, 'PickingContext');

export const usePickingContext = (isPicking: boolean = true) => {
  const renderContext = useContext(RenderContext);

  const pickingContext = isPicking ? useContext(PickingContext) : useNoContext(PickingContext);  
  const resolvedContext = pickingContext?.renderContext ?? renderContext;

  return {renderContext: resolvedContext};
}

export type PickingProps = {
  pickingFormat?: GPUTextureFormat, 
  pickingColor?: GPUColor,
  depthStencilFormat?: GPUTextureFormat,
  resolution?: number,

  children?: LiveElement<any>,
}

const NOP = () => {};

export const Picking: LiveComponent<PickingProps> = (props) => {
  const device = useContext(DeviceContext);
  const renderContext = useContext(RenderContext);

  const {
    pickingFormat = PICKING_FORMAT,
    pickingColor = PICKING_COLOR,
    depthStencilFormat = DEPTH_STENCIL_FORMAT,
    resolution = 1/2,

    children,
  } = props;

  const {colorStates: renderColorStates} = renderContext;
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

    const colorAttachments = [makeColorAttachment(pickingTexture, null, pickingColor)];
    const depthStencilAttachment = makeDepthStencilAttachment(depthTexture, depthStencilFormat);

    let updated = false;
    let waiting = false;
    let captured = null as TypedArray | null;
    const captureTexture = async () => {
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
      }

      pickingBuffer.unmap();
      waiting = false;
      updated = false;
    }

    const swapView = () => {
      updated = true;
    };

    const sampleTexture = (x: number, y: number): number[] => {
      if (!captured) return seq(itemDims).map(i => 0);

      const xs = Math.round(x * resolution / dpi);
      const ys = Math.round(y * resolution / dpi);

      const offset = (itemsPerRow * ys + xs) * itemDims;
      const index = seq(itemDims).map(i => captured![offset + i]);
      return index;
    }
    
    const pickingSource = {
      texture: pickingTexture,
      sampler: null,
      layout: 'texture_2d<u32>',
      variant: 'textureLoad',
      args: ['vec2<i32>', 'i32'],
      format: pickingFormat,
      size: [width, height],
      colorSpace: 'picking',
      version: 0,
    };

    const context = {
      renderContext: {
        ...renderContext,
        width,
        height,
        samples,
        colorStates,
        colorAttachments,
        depthStencilAttachment,
        swapView,
      } as UseRenderingContextGPU,
      pickingTexture,
      pickingSource,
      captureTexture,
      sampleTexture,
    };
    
    return context;
  }, [device, renderContext, colorStates, depthStencilState, resolution]);

  return provide(PickingContext, pickingContext, children);
};
