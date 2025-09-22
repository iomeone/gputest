import { LiveFiber, LiveFunction, LiveElement } from '../live/types';

export type RawFiber = () => LiveElement<any>;
export type LiveReturner = () => LiveElement<any>;

export const Raw: LiveFunction<LiveReturner> = (f: RawFiber) => f();
