import { LiveFiber, LiveFunction, LiveElement } from '@use-gpu/live/types';

export type RawFiber = () => LiveElement<any>;
export type LiveReturner = () => LiveElement<any>;

export const Raw: LiveFunction<LiveReturner> = (f: RawFiber) => f();
