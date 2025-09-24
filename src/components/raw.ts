import { LiveFunction, LiveElement, ArrowFunction } from '@use-gpu/live/types';

export type LiveReturner = (f: ArrowFunction) => LiveElement<any>;
export const Raw: LiveFunction<LiveReturner> = (f: ArrowFunction) => f();
