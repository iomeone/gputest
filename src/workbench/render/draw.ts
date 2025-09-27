import type { LiveFiber, LC, PropsWithChildren, LiveElement, Task, DeferredCall } from '@use-gpu/live';

import {
  gather, provide, yeet,
  makeContext, useContext, useNoContext,
} from '@use-gpu/live';
import { RenderContext } from '../providers/render-provider';
import { usePerFrame, useNoPerFrame } from '../providers/frame-provider';
import { PickingContext } from './picking';

export type DrawProps = {
  live?: boolean,
  render?: () => LiveElement<any>,
};

const NOP = () => {};

export const Draw: LC<DrawProps> = (props: PropsWithChildren<DrawProps>): DeferredCall<any> => {
  const {live = true, render, children} = props;

  if (live) usePerFrame();
  else useNoPerFrame();

  return gather(children ?? (render ? render() : null), Resume);
};

const Resume = (ts: Task[]) => {
  const pickingContext = useContext(PickingContext);

  usePerFrame();

  for (let task of ts) task();

  if (pickingContext) pickingContext.captureTexture();

  return null;
};
