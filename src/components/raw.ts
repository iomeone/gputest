import { LiveFunction, LiveElement, ArrowFunction } from '../live/types';
import { imperative } from '../live';

export type LiveReturner = (f: ArrowFunction) => LiveElement<any>;
export const Raw: LiveFunction<LiveReturner> = imperative((f: ArrowFunction) => f(), 'Raw');
