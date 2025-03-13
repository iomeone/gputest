import type { LiveFiber } from '@use-gpu/live';
import { RECONCILE, YEET, QUOTE, UNQUOTE, SIGNAL } from '@use-gpu/live';

export enum FiberTag {
  Quote = 1,
  Yeet = 2,
  React = 4,
  Output = 8,
  Layout = 16,
  Raster = 32,
  Compute = 64,
  View = 128,
  Highlight = 256,
  Reconcile = 512,
  Other = 1024,
  All = 2047,
};

export const getFiberTags = (fiber: LiveFiber<any>) => {
  const {f, type, __inspect} = fiber;

  const quote = type === QUOTE || type === UNQUOTE || type === SIGNAL || f.isLiveQuote;
  const yeet = type === YEET;
  const reconcile = type === RECONCILE || f === RECONCILE || f.isLiveReconcile;

  const react = !!__inspect?.react;
  const output = !!__inspect?.output;
  const layout = !!__inspect?.layout;
  const raster = !!__inspect?.vertex || !!__inspect?.fragment;
  const compute = !!__inspect?.compute;
  const view = !!__inspect?.view;
  const hover = !!__inspect?.setHovered;

  return (
    (+!!quote         ) |
    (+!!yeet      << 1) |
    (+!!react     << 2) |
    (+!!output    << 3) |
    (+!!layout    << 4) |
    (+!!raster    << 5) |
    (+!!compute   << 6) |
    (+!!view      << 7) |
    (+!!hover     << 8) |
    (+!!reconcile << 9)
  ) || (1 << 10);
};
