import { LiveFiber } from '@use-gpu/live/types';
import { formatValue, YEET } from '@use-gpu/live';

import React, { useMemo } from 'react';

import { useRefineCursor, Cursor } from './cursor';
import { Node } from './node';
import { PingState, ExpandState, SelectState, HoverState, Action } from './types';

import { TreeWrapper, TreeRow, TreeIndent, TreeLine, TreeToggle, TreeLegend, TreeLegendItem, SplitColumn, SplitColumnFull, Muted } from './layout';
import { Expandable } from './expandable';

const ICON = (s: string) => <span className="m-icon">{s}</span>
const ICONSMALL = (s: string) => <span className="m-icon m-icon-small">{s}</span>

type FiberTreeProps = {
  fiber: LiveFiber<any>,
  fibers: Map<number, LiveFiber<any>>,
  ping: PingState,
  expandCursor: Cursor<ExpandState>,
  selectedCursor: Cursor<SelectState>,
  hoveredCursor: Cursor<HoverState>,
}

type FiberNodeProps = {
  fiber: LiveFiber<any>,
  fibers: Map<number, LiveFiber<any>>,
  ping: PingState,
  expandCursor: Cursor<ExpandState>,
  selectedCursor: Cursor<SelectState>,
  hoveredCursor: Cursor<HoverState>,
  indent?: number,
  continuation?: boolean,
}

type TreeExpandProps = {
  expand: boolean,
  onToggle: (e: any) => void,
  openIcon?: string,
  closedIcon?: string,
}

export const FiberLegend: React.FC = () => {
  const makeFiber = (name: string) => {
    const f = (() => {}) as any;
    const fiber = {f, id: 0, by: 1} as any;
    f.displayName = name;
    return fiber;
  };

  const fiber = makeFiber(' ');

  return (<>
    <TreeLegend>
      <TreeLegendItem>
        <Node
          fiber={fiber}
          staticMount={true}
        />
        <span>Mounted</span>
      </TreeLegendItem>
      <TreeLegendItem>
        <Node
          fiber={fiber}
          staticPing={true}
        />
        <span>Updated</span>
      </TreeLegendItem>
      <TreeLegendItem>
        <Node
          fiber={fiber}
          hovered={0}
        />
        <span>Rendered By</span>
      </TreeLegendItem>
      <TreeLegendItem>
        <Node
          fiber={fiber}
          depended={true}
        />
        <span>Dependency</span>
      </TreeLegendItem>
    </TreeLegend>
  </>)
};

export const FiberTree: React.FC<FiberTreeProps> = ({
  fiber,
  fibers,
  ping,
  expandCursor,
  selectedCursor,
  hoveredCursor,
}) => {

  return (
    <SplitColumnFull>
      <TreeWrapper>
        <FiberNode
          fiber={fiber}
          fibers={fibers}
          ping={ping}
          expandCursor={expandCursor}
          selectedCursor={selectedCursor}
          hoveredCursor={hoveredCursor}
        />
      </TreeWrapper>
      <FiberLegend />
    </SplitColumnFull>
  );
}

export const FiberNode: React.FC<FiberNodeProps> = ({
  fiber,
  fibers,
  ping,
  expandCursor,
  selectedCursor,
  hoveredCursor,
  continuation,
  indent = 0,
}) => {
  const {id, mount, mounts, next, order, depth, host, yeeted} = fiber;
  const [selectState, updateSelectState] = selectedCursor;
  const [hoverState, updateHoverState] = hoveredCursor;

  fibers.set(id, fiber);

  const pinged = ping[id] || 0;
  const selected = fiber === selectState;
  const hovered = hoverState.fiber?.id ?? -1;
  const depended = hoverState.deps.indexOf(fiber) >= 0 || (hoverState.root === fiber);

  const [select, hover, unhover] = useMemo(() => {
    const root = yeeted && fiber.type === YEET ? yeeted.root : null;

    const select  = () => updateSelectState({ $set: fiber });
    const hover   = () => updateHoverState({ $set: {
      fiber,
      deps: host.invalidate(fiber),
      root,
    } });
    const unhover = () => updateHoverState({ $set: {
      fiber: null,
      deps: [],
      root: null,
    } });
    return [select, hover, unhover];
  }, [fiber, updateSelectState, updateHoverState]);

  const out = [] as React.ReactElement[];

  const nodeRender = (
    <Node
      key={id}
      fiber={fiber}
      pinged={pinged}
      selected={selected}
      hovered={hovered}
      depended={depended}
      onClick={select}
      onMouseEnter={hover}
      onMouseLeave={unhover}
    />
  );
     
  if (mount) {
    const hasNext = (mount.mount || mount.mounts || mount.next);
    out.push(
      <FiberNode
        key='mount'
        fiber={mount}
        fibers={fibers}
        ping={ping}
        expandCursor={expandCursor}
        selectedCursor={selectedCursor}
        hoveredCursor={hoveredCursor}
        indent={indent + (next || !hasNext ? 1 : .1) + (continuation ? 1 : 0)}
      />
    );
  }

  if (mounts && order) {
    for (const key of order) {
      const sub = mounts.get(key);
      if (sub) {
        out.push(
          <FiberNode
            key={key}
            fiber={sub}
            fibers={fibers}
            ping={ping}
            expandCursor={expandCursor}
            selectedCursor={selectedCursor}
            hoveredCursor={hoveredCursor}
            indent={indent + 1 + (continuation ? 1 : 0)}
          />
        );
      }
    }
  }

  let childRender = out as any;

  let nextRender = null as React.ReactElement | null;
  if (next) {
    childRender = (
      <TreeIndent indent={indent + .5}>
        <TreeLine>
          <TreeIndent indent={-indent - .5}>
            {out}
          </TreeIndent>
        </TreeLine>
      </TreeIndent>
    );
    nextRender = (
      <FiberNode
        fiber={next}
        fibers={fibers}
        ping={ping}
        expandCursor={expandCursor}
        selectedCursor={selectedCursor}
        hoveredCursor={hoveredCursor}
        continuation
        indent={indent - +!!out.length}
      />
    );
  }

  if (out.length) {
    const openIcon = continuation ? 'arrow_downward' : undefined;
    const closedIcon = continuation ? 'subdirectory_arrow_right' : undefined;
    return (
      <Expandable id={id} expandCursor={expandCursor}>{
        (expand, onToggle) => (<>
          <TreeRow indent={indent + !!continuation}>
            <TreeExpand expand={expand} onToggle={onToggle} openIcon={openIcon} closedIcon={closedIcon}>
              {nodeRender}
            </TreeExpand>
          </TreeRow>
          {expand !== false ? childRender : null}
          {nextRender}
        </>)
      }</Expandable>
    );
  }

  const continuationIcon = ICONSMALL('subdirectory_arrow_right');
  return (<>
    <TreeRow indent={indent + 1}>
      {continuation ? <Muted>{continuationIcon}</Muted> : null}
      {nodeRender}
    </TreeRow>
    {nextRender}
  </>);
}

export const TreeExpand: React.FC<TreeExpandProps> = ({
  expand,
  onToggle,
  children,
  openIcon = 'expand_more',
  closedIcon = 'chevron_right',
}) => {
  const icon = expand !== false ? ICON(openIcon) : ICON(closedIcon) ;

  return (<>
    <TreeRow>
      <TreeToggle onClick={onToggle}>{icon}</TreeToggle>
      {children}
    </TreeRow>
  </>);
}
