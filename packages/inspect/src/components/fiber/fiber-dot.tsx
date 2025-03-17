import type { LiveFiber } from '@use-gpu/live';

import React, { forwardRef } from 'react';
import { usePingTracker } from '../../providers/ping-provider';

export type FiberDotProps = {
  fiber: LiveFiber<any>,
  pinged?: number,
  selected?: boolean,
  hovered?: number,
  depends?: boolean,
  precedes?: boolean,
  quoted?: boolean,
  unquoted?: boolean,
  parents?: boolean,
  depth?: number,
  ooo?: boolean,
  absolute?: boolean,
};

export const FiberDot = forwardRef<HTMLDivElement, FiberDotProps>(({
  fiber,
  selected,
  hovered,
  depends,
  precedes,
  quoted,
  unquoted,
  parents,
  depth,
  ooo,
  absolute,
}, ref) => {
  const {id, by, f} = fiber;

  const [version, pinged] = usePingTracker(fiber);
  if (version <= 1) return null;
  
  const classes: string[] = ['pinged'];

  if (!pinged) classes.push('cold');
  if (selected) classes.push('selected');

  if (depends) classes.push('depends');
  if (precedes) classes.push('precedes');
  if (quoted) classes.push('quoted');
  if (unquoted) classes.push('unquoted');
  if (parents) classes.push('parents');
  if (hovered !== -1) classes.push('hovering');
  if (hovered === id) classes.push('hovered');
  if (hovered === by) classes.push('by');
  if (absolute) classes.push('absolute');
  if (ooo) classes.push('error');

  if (f.isLiveBuiltin || f.isLiveReconcile || f.isLiveQuote || f.isLiveContinuation) classes.push('builtin');

  classes.push(`depth-${Math.min(4, depth || 0)}`);

  const className = classes.join(' ');

  return (
    <div
      ref={ref}
      className={"fiber-tree-dot " + className}
    >
      <div className={"fiber-tree-ping cover-parent " + className} />
      <div className={"fiber-tree-highlight cover-parent " + className} />
    </div>
  );
});
