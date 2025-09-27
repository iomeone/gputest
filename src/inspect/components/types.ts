import { LiveFiber } from '@use-gpu/live/types';

export type ExpandState = Record<number, boolean>;
export type PingState = Record<number, number>;
export type SelectState = LiveFiber<any> | null;
export type HoverState = {
  fiber: LiveFiber<any> | null,
  root: LiveFiber<any> | null,
  deps: LiveFiber<any>[],
  precs: LiveFiber<any>[],
};

export type Action = () => void;
