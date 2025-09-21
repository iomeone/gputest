import { LiveComponent, LiveElement } from '../live/types';
import { CanvasRenderingContextGPU } from '../webgpu/types';
import {
  PICKING_FORMAT,
  PICKING_COLOR,
} from './constants';

import { RenderContext, RenderProvider } from './render-provider';
import { memo, use, provide, useContext, useMemo, makeContext } from '../live';
import {
  makeColorState,
  makeColorAttachment,
  makeRenderTexture,
} from '../core';

type PickingContextType = {
  renderContext: CanvasRenderingContextGPU,
  pickingTexture: GPUTexture,
};

export const PickingContext = makeContext(null, 'PickingContext');

export type PickingProps = {
  pickingFormat?: GPUTextureFormat, 
  pickingColor?: GPUColor,
  resolution: number,

  children?: LiveElement<any>,
}

export const Picking: LiveComponent<PickingProps> = (fiber) => (props) => {
  const renderContext = useContext(RenderContext);

  const {
    pickingFormat = PICKING_FORMAT,
    pickingColor = PICKING_COLOR,
    resolution = 1,

    children,
  } = props;

  const pickingContext = useMemo(() => {
    const {device, width: w, height: h} = renderContext;
    const width = w * resolution;
    const height = h * resolution;

    const pickingTexture = makeRenderTexture(device, width, height, pickingFormat, 4);

    const colorStates = [
      ...renderContext.colorStates,
      makeColorState(pickingFormat),
    ];
    const colorAttachments = [
      ...renderContext.colorAttachments,
      makeColorAttachment(pickingTexture, null, pickingColor),
    ];

    const context = {
      renderContext: {
        ...renderContext,
        colorStates,
        colorAttachments,
      } as CanvasRenderingContextGPU,
      pickingTexture,
    };
    
    return context;
  }, [renderContext, pickingFormat, pickingColor, resolution]);

  return use(PickingProvider)({ pickingContext, children });
}

export type PickingProviderProps = {
  pickingContext: PickingContextType,
  children: LiveElement<any>,
};

export const PickingProvider: LiveComponent<PickingProviderProps> = memo((fiber) => (props) => {
  const {pickingContext, children} = props;
  return provide(PickingContext, pickingContext, children);
}, 'PickingProvider');
