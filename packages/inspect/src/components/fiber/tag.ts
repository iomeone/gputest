import type { LiveFiber } from '@use-gpu/live';
import { RECONCILE, YEET, QUOTE, UNQUOTE, SIGNAL } from '@use-gpu/live';

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
  const hover = !!__inspect?.setHovered;

  return (
    (+!!quote         ) |
    (+!!yeet      << 1) |
    (+!!react     << 2) |
    (+!!output    << 3) |
    (+!!layout    << 4) |
    (+!!raster    << 5) |
    (+!!compute   << 6) |
    (+!!hover     << 7) |
    (+!!reconcile << 8) 
  ) || (1 << 9);
};
