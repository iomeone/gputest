import { LiveFiber, LiveFunction, LiveElement } from '@use-gpu/live/types';

import { enterFiber, exitFiber } from '@use-gpu/live'; 

export type RawFiber = (fiber: LiveFiber<any>) => LiveElement<any>;
export type LiveReturner = (fiber: RawFiber) => LiveElement<any>;

export const Inline: LiveFunction<LiveReturner> = (fiber) => (f: RawFiber) => {
  enterFiber(fiber, 0);
  const v = f(fiber);
  exitFiber();
  return v;
}
