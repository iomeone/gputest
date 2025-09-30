import type { OffscreenRenderContext } from '@use-gpu/core';
import { makeContext, useContext, useNoContext } from '@use-gpu/live';

export type PickingContextProps = {
  renderContext: OffscreenRenderContext,
  captureData: () => void,

  samplePoint: (x: number, y: number) => number[],
  sampleRectangle: (x1: number, y1: number, x2: number, y2: number) => Map<number, Set<number>>,
};

export const PickingContext = makeContext<PickingContextProps>(undefined, 'PickingContext');

export const usePickingContext = () => useContext<PickingContextProps>(PickingContext);
export const useNoPickingContext = () => useNoContext(PickingContext);
