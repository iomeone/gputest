import { LiveFiber } from '@use-gpu/live/types';

export type ExpandState = Record<number, boolean>;
export type PingState = Record<number, number>;
export type SelectState = LiveFiber<any> | null;

export type Action = () => void;
