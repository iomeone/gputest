import type { LiveFiber } from '@use-gpu/live';
import type { Action } from './types';

import { formatValue, formatNodeName, YEET, QUOTE, SIGNAL } from '@use-gpu/live';
import { styled, keyframes } from "@stitches/react";

import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { usePingTracker } from '../providers/ping-provider';
import { Muted } from './layout';
import { IconRow, SVGAtom, SVGHighlightElement, SVGYeet, SVGQuote, SVGDashboard, SVGViewOutput } from './svg';

type NodeProps = {
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
  onClick?: (e: any) => void,
  onMouseEnter?: (e: any) => void,
  onMouseLeave?: (e: any) => void,
};

export const Node = React.forwardRef<HTMLDivElement, NodeProps>(({
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
  onClick,
  onMouseEnter,
  onMouseLeave,
}, ref) => {
  const {id, by, f, type, args, __inspect} = fiber;

  const quote = type === QUOTE || type === SIGNAL;
  const yeet = type === YEET;
  const react = !!__inspect?.react;
  const output = !!__inspect?.output;
  const layout = !!__inspect?.layout;

  const suffix1 = yeet ? <SVGYeet key="yeet" title="Yeet" /> : null;
  const suffix2 = react ? <SVGAtom key="atom" title="React" /> : null;
  const suffix3 = !layout && __inspect?.setHovered ? <SVGHighlightElement key="layout" title="Highlight" /> : null;
  const suffix4 = layout ? <SVGDashboard key="dash" title="Layout" /> : null;
  const suffix5 = quote ? <SVGQuote key="quote" title="Quote" /> : null;
  const suffix6 = output ? <SVGViewOutput key="output" title="Output" /> : null;
  const suffix7 = ooo ? '⚠️' : null;

  const icons = [suffix1, suffix2, suffix3, suffix4, suffix5, suffix6, suffix7].filter(x => !!x);

  const [version, pinged] = usePingTracker(fiber);

  const classes: string[] = version >= 0 ? [version > 1 ? 'pinged' : 'mounted'] : [];

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
  if (f.isLiveBuiltin) classes.push('builtin');
  classes.push(`depth-${Math.min(4, depth || 0)}`);
  const className = classes.join(' ');

  const handleClick = useCallback((e: any) => {
    e.stopPropagation();
    e.preventDefault();
    onClick && onClick(e);
  }, [onClick]);

  const name = formatNodeName(fiber);
  const label = runCount && (name !== ' ') ? <>{name} <Muted>({fiber.runs})</Muted></> : name;

  return (
    <div
      ref={ref}
      className={"fiber-tree-node " + className}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className={"fiber-tree-ping cover-parent " + className} />
      <div className={"fiber-tree-highlight cover-parent " + className} />
      <div className={"fiber-tree-label " + className}>{label}<IconRow>{icons}</IconRow></div>
    </div>
  );
});
