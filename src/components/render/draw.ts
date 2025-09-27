import { LiveFiber, LiveComponent, LiveElement, Task } from '@use-gpu/live/types';
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
  children?: LiveElement<any>,
};

const NOP = () => {};

export const Draw: LiveComponent<DrawProps> = (props) => {
  const {live = true, render, children} = props;

  if (live) usePerFrame();
  else useNoPerFrame();

  return gather(children ?? (render ? render() : null), Resume);
};

const Resume = (ts: Task[]) => {
  const {swapView} = useContext(RenderContext);
  const pickingContext = useContext(PickingContext);

  usePerFrame();
  swapView();

  for (let task of ts) task();

  if (pickingContext) pickingContext.captureTexture();
};
