import type { LiveFiber } from '@use-gpu/live';

import { formatNodeName } from '@use-gpu/live';

import React, { forwardRef, useCallback } from 'react';
import { usePingTracker } from '../../providers/ping-provider';
import { Muted } from '../layout';
import { FiberTag, getFiberTags } from '../fiber/tag';
import { IconRow, SVGAtom, SVGHighlightElement, SVGYeet, SVGQuote, SVGDashboard, SVGViewOutput, SVGRaster, SVGCompute, SVGCamera } from '../svg';

type FiberBadgeProps = {
  fiber: LiveFiber<any>,
  pinged?: number,
  staticPing?: boolean,
  staticMount?: boolean,
  selected?: boolean,
  hovered?: number,
  depends?: boolean,
  precedes?: boolean,
  quoted?: boolean,
  unquoted?: boolean,
  parents?: boolean,
  depth?: number,
  ooo?: boolean,
  runCount?: boolean,
  absolute?: boolean,
  onClick?: (e: any) => void,
  onDoubleClick?: (e: any) => void,
  onMouseEnter?: (e: any) => void,
  onMouseLeave?: (e: any) => void,
};

export const FiberBadge = forwardRef<HTMLDivElement, NodeProps>(({
  fiber,
  staticPing,
  staticMount,
  selected,
  hovered,
  depends,
  precedes,
  quoted,
  unquoted,
  parents,
  depth,
  ooo,
  runCount,
  absolute,
  onClick,
  onDoubleClick,
  onMouseEnter,
  onMouseLeave,
}, ref) => {
  const {id, by, f, type, __inspect} = fiber;

  const tags = getFiberTags(fiber);
  
  const quote = tags & FiberTag.Quote;
  const yeet = tags & FiberTag.Yeet;
  const react = tags & FiberTag.React;
  const output = tags & FiberTag.Output;
  const layout = tags & FiberTag.Layout;
  const raster = tags & FiberTag.Raster;
  const compute = tags & FiberTag.Compute;
  const view = tags & FiberTag.View;
  const hover = tags & FiberTag.Hover;

  const suffix1 = yeet ? <SVGYeet key="yeet" title="Yeet" /> : null;
  const suffix2 = react ? <SVGAtom key="atom" title="React" /> : null;
  const suffix3 = !layout && __inspect?.setHovered ? <SVGHighlightElement key="layout" title="Highlight" /> : null;
  const suffix4 = layout ? <SVGDashboard key="dash" title="Layout" /> : null;
  const suffix5 = quote ? <SVGQuote key="quote" title="Quote" /> : null;
  const suffix6 = output ? <SVGViewOutput key="output" title="Output" /> : null;
  const suffix7 = raster ? <SVGRaster key="raster" title="Raster" /> : null;
  const suffix8 = compute ? <SVGCompute key="compute" title="Compute" /> : null;
  const suffix9 = view ? <SVGCamera key="view" title="View" /> : null;
  const suffix10 = ooo ? '⚠️' : null;

  const icons = [suffix1, suffix2, suffix3, suffix4, suffix5, suffix6, suffix7, suffix8, suffix9, suffix10].filter(x => !!x);

  const [version, pinged] = usePingTracker(fiber);

  const classes: string[] = [+version > 1 ? 'pinged' : 'mounted'];

  if (!pinged) classes.push('cold');
  if (selected) classes.push('selected');
  if (staticPing) classes.push('staticPing');
  if (staticMount) classes.push('staticMount');
  if (depends) classes.push('depends');
  if (precedes) classes.push('precedes');
  if (quoted) classes.push('quoted');
  if (unquoted) classes.push('unquoted');
  if (parents) classes.push('parents');
  if (hovered !== -1) classes.push('hovering');
  if (hovered === id) classes.push('hovered');
  if (hovered === by) classes.push('by');
  if (absolute) classes.push('absolute');
  if (f.isLiveBuiltin || f.isLiveReconcile || f.isLiveQuote || f.isLiveContinuation) classes.push('builtin');
  classes.push(`depth-${Math.min(4, depth || 0)}`);
  const className = classes.join(' ');

  const handleClick = useCallback((e: any) => {
    onClick && onClick(e);
    e.stopPropagation();
    e.preventDefault();
  }, [onClick]);

  const name = formatNodeName(fiber);
  const label = runCount && (name !== ' ') && fiber.runs !== 0 ? <>{name} <Muted>({fiber.runs})</Muted></> : name;

  return (
    <div
      ref={ref}
      className={"fiber-tree-node " + className}
      onClick={handleClick}
      onDoubleClick={(e) => {
        onDoubleClick?.(e);
        e.stopPropagation();
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className={"fiber-tree-ping cover-parent " + className} />
      <div className={"fiber-tree-highlight cover-parent " + className} />
      <div className={"fiber-tree-label " + className}>{label}<IconRow>{icons}</IconRow></div>
    </div>
  );
});
