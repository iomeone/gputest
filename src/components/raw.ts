import { LiveFunction, LiveElement, ArrowFunction } from '@use-gpu/live/types';
import { imperative } from '@use-gpu/live';

export type LiveReturner = (f: ArrowFunction) => LiveElement<any>;
export const Raw: LiveFunction<LiveReturner> = imperative((f: ArrowFunction) => f(), 'Raw');
