import type { LiveFiber } from '../../../live';
import { RECONCILE, YEET, QUOTE, UNQUOTE, SIGNAL } from '../../../live';

export enum FiberTag {
  Quote = 1,
  Yeet = 2,
  React = 4,
  Texture = 8,
  Layout = 16,
  Raster = 32,
  Compute = 64,
  View = 128,
  Data = 256,
  Highlight = 512,
  Reconcile = 1024,
  Other = 2048,
  All = 4095,

  By = 4096,
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
  const data = !!__inspect?.data;
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
    (+!!data      << 8) |
    (+!!hover     << 9) |
    (+!!reconcile << 10)
  ) || (1 << 11);
};
