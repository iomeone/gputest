import { LiveFiber } from '@use-gpu/live/types';
import { formatValue, formatNodeName } from '@use-gpu/live';
import { styled, keyframes } from "@stitches/react";

import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { Action } from './types';
import { usePingContext } from './ping';
import { SVGAtom } from './svg-atom';

const ICON = (s: string) => <span className="m-icon">{s}</span>
const ICONSMALL = (s: string) => <span className="m-icon m-icon-small">{s}</span>

type NodeProps = {
  fiber: LiveFiber<any>,
  pinged?: number,
  staticPing?: boolean,
  staticMount?: boolean,
  selected?: boolean,
  hovered?: number,
  depends?: boolean,
  precedes?: boolean,
  parents?: boolean,
  depth?: number,
  onClick?: Action,
  onMouseEnter?: Action,
  onMouseLeave?: Action,
};

export const Node: React.FC<NodeProps> = ({
  fiber,
  staticPing,
  staticMount,
  selected,
  hovered,
  depends,
  precedes,
  parents,
  depth,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const {id, by, f, args, yeeted, __inspect} = fiber;

  const yeet = yeeted?.value !== undefined;
  const react = !!__inspect?.react;

  const suffix1 = yeet ? ICONSMALL("switch_left") : null;
  const suffix2 = react ? <SVGAtom /> : null;

  const [version, pinged] = usePingContext(fiber);

  const classes: string[] = version >= 0 ? [version > 1 ? 'pinged' : 'mounted'] : [];

  if (!pinged) classes.push('cold');
  if (selected) classes.push('selected');
  if (staticPing) classes.push('staticPing');
  if (staticMount) classes.push('staticMount');
  if (depends) classes.push('depends');
  if (precedes) classes.push('precedes');
  if (parents) classes.push('parents');
  if (hovered !== -1) classes.push('hovering');
  if (hovered === id) classes.push('hovered');
  if (hovered === by) classes.push('by');
  if (f.isLiveBuiltin) classes.push('builtin');
  classes.push(`depth-${Math.min(4, depth)}`);
  const className = classes.join(' ');

  const elRef = useRef<HTMLDivElement | null>(null);
  const {current: el} = elRef;

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    onClick && onClick();
  }, [onClick]);

  const name = formatNodeName(fiber);

  return (
    <div
      ref={elRef}
      className={"fiber-tree-node " + className}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className={"fiber-tree-ping cover-parent " + className} />
      <div className={"fiber-tree-highlight cover-parent " + className} />
      <div className={"fiber-tree-label " + className}>{name}{suffix1}{suffix2}</div>
    </div>
  );
}
