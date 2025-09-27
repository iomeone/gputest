import { LiveFiber } from '@use-gpu/live/types';
import { formatValue, isSubNode, YEET, DEBUG } from '@use-gpu/live';

import React, { memo, useMemo } from 'react';

import { useRefineCursor, Cursor } from './cursor';
import { usePingContext } from './ping';
import { Node } from './node';
import { ReactNode } from './react-node';
import { ExpandState, SelectState, HoverState, Action } from './types';

import { TreeWrapper, TreeRow, TreeIndent, TreeLine, TreeToggle, TreeLegend, TreeRowOmitted, TreeLegendItem, SplitColumn, SplitColumnFull, Muted } from './layout';
import { Expandable } from './expandable';

const ICON = (s: string) => <span className="m-icon">{s}</span>
const ICONSMALL = (s: string) => <span className="m-icon m-icon-small">{s}</span>

type FiberTreeProps = {
  fiber: LiveFiber<any>,
  fibers: Map<number, LiveFiber<any>>,
  depthLimit: number,
  expandCursor: Cursor<ExpandState>,
  selectedCursor: Cursor<SelectState>,
  hoveredCursor: Cursor<HoverState>,
}

type FiberNodeProps = {
  fiber: LiveFiber<any>,
  fibers: Map<number, LiveFiber<any>>,
  expandCursor: Cursor<ExpandState>,
  selectedCursor: Cursor<SelectState>,
  hoveredCursor: Cursor<HoverState>,
  indent?: number,
  continuation?: boolean,
  siblings?: boolean,
}

type FiberReactNodeProps = {
  reactNode: any,
  expandCursor: Cursor<ExpandState>,
  indent?: number,
  first?: boolean,
}

type TreeExpandProps = {
  expand: boolean,
  onToggle: (e: any) => void,
  openIcon?: string,
  closedIcon?: string,
}

// Get rendered-by depth by tracing `by` props up the tree
const getRenderDepth = (fibers: Map<number, LiveFiber<any>>, fiber: LiveFiber<any>) => {
  let renderDepth = 0;
  let parent = fiber;
  if (parent.by) {
    while (parent) {
      const {by} = parent;
      const source = fibers.get(by);
      if (source && source?.next !== parent) renderDepth++;
      parent = source as any;
    }
  }
  return renderDepth;
};

// Legend at bottom of fiber tree
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
          depends={true}
        />
        <span>Dependency</span>
      </TreeLegendItem>
    </TreeLegend>
  </>)
};

// Fiber tree including legend
export const FiberTree: React.FC<FiberTreeProps> = ({
  fiber,
  fibers,
  depthLimit,
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
          depthLimit={depthLimit}
          expandCursor={expandCursor}
          selectedCursor={selectedCursor}
          hoveredCursor={hoveredCursor}
        />
      </TreeWrapper>
      <FiberLegend />
    </SplitColumnFull>
  );
}

// One node in the tree
export const FiberNode: React.FC<FiberNodeProps> = memo(({
  fiber,
  fibers,
  depthLimit,
  expandCursor,
  selectedCursor,
  hoveredCursor,
  continuation,
  siblings,
  indent = 0,
}) => {
  const {id, mount, mounts, next, order, host, yeeted, __inspect} = fiber;
  const [selectState, updateSelectState] = selectedCursor;
  const [hoverState, updateHoverState] = hoveredCursor;

  // Hook up ping provider
  fibers.set(id, fiber);
  usePingContext(fiber);

  // Resolve hover-state
  const selected = fiber === selectState;
  const hovered  = hoverState.fiber?.id ?? -1;
  const parents  = hoverState.fiber?.by === fiber.id;
  const depends  = hoverState.deps.indexOf(fiber) >= 0 || (hoverState.root === fiber);
  const precedes = hoverState.precs.indexOf(fiber) >= 0 || (yeeted?.root === hoverState.fiber && yeeted.value !== undefined);

  // Resolve depth-highlighting
  const subnode = hoverState.by ? isSubNode(hoverState.by, fiber) : true;
  const renderDepth = getRenderDepth(fibers, fiber);
  const styleDepth = hoverState.fiber ? (subnode ? Math.max(-1, renderDepth - hoverState.depth) : -1) : 0;

  // Resolve node omission
  const shouldRender = renderDepth < depthLimit;
  const shouldStartOpen = fiber.f !== DEBUG && !fiber.__inspect?.react;

  // Make click/hover handlers
  const [select, hover, unhover] = useMemo(() => {
    const root = yeeted && fiber.type === YEET ? yeeted.root : null;

    const select  = () => updateSelectState({ $set: fiber });
    const hover   = () => updateHoverState({ $set: {
      fiber,
      by: fibers.get(fiber.by),
      deps: host ? Array.from(host.traceDown(fiber)) : [],
      precs: host ? Array.from(host.traceUp(fiber)) : [],
      root,
      depth: renderDepth,
    } });
    const unhover = () => updateHoverState({ $set: {
      fiber: null,
      by: null,
      deps: [],
      precs: [],
      root: null,
      depth: 0,
    } });
    return [select, hover, unhover];
  }, [fiber, updateSelectState, updateHoverState]);

  const out = [] as React.ReactElement[];

  // Render node itself
  const nodeRender = shouldRender ? (
    <Node
      key={id}
      fiber={fiber}
      selected={selected}
      hovered={hovered}
      parents={parents}
      precedes={precedes}
      depends={depends}
      depth={styleDepth}
      onClick={select}
      onMouseEnter={hover}
      onMouseLeave={unhover}
    />
  ) : null;

  // Render single child   
  if (mount) {
    const hasNext = (mount.mount || mount.mounts || mount.next);
    out.push(
      <FiberNode
        key='mount'
        fiber={mount}
        fibers={fibers}
        depthLimit={depthLimit}
        expandCursor={expandCursor}
        selectedCursor={selectedCursor}
        hoveredCursor={hoveredCursor}
        indent={indent + (shouldRender ? ((next || !hasNext || siblings) ? 1 : .1) : 0) + (continuation ? 1 : 0)}
      />
    );
  }

  // Render multiple children
  if (mounts && order) {
    for (const key of order) {
      const sub = mounts.get(key);
      if (sub) {
        out.push(
          <FiberNode
            key={key}
            fiber={sub}
            fibers={fibers}
            depthLimit={depthLimit}
            expandCursor={expandCursor}
            selectedCursor={selectedCursor}
            hoveredCursor={hoveredCursor}
            indent={indent + (shouldRender ? 1 : 0) + (continuation ? 1 : 0)}
            siblings={order.length > 1}
          />
        );
      }
    }
  }

  // Render attached react root
  if (shouldRender && __inspect?.react) {
    const {react} = __inspect;
    const node = react.root?.current;
    
    if (node) {
      out.push(
        <FiberReactNode
          key={'react'}
          reactNode={react.root.current}
          expandCursor={expandCursor}
          indent={indent + 1}
          first={true}
        />
      );
    }
  }

  let childRender = out as any;

  // Render fiber continuation
  let nextRender = null as React.ReactElement | null;
  if (next) {
    childRender = shouldRender ? (
      <TreeIndent indent={indent + .5}>
        <TreeLine>
          <TreeIndent indent={-indent - .5}>
            {out}
          </TreeIndent>
        </TreeLine>
      </TreeIndent>
    ) : out;

    nextRender = (
      <FiberNode
        fiber={next}
        fibers={fibers}
        depthLimit={depthLimit}
        expandCursor={expandCursor}
        selectedCursor={selectedCursor}
        hoveredCursor={hoveredCursor}
        continuation
        indent={indent - +!!out.length}
      />
    );
  }

  // Compact omitted row
  if (!shouldRender) {
    return (<>
      <TreeRowOmitted indent={indent} />
      {childRender}
      {nextRender}
    </>);
  }
  
  // Expandable node
  if (out.length) {
    const openIcon = continuation ? 'arrow_downward' : undefined;
    const closedIcon = continuation ? 'subdirectory_arrow_right' : undefined;
    return (
      <Expandable
        id={id}
        expandCursor={expandCursor}
        initialValue={shouldStartOpen}
      >{
        (expand, onToggle) => (<>
          <TreeRow indent={indent + +!!continuation}>
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

  // Leaf node
  const continuationIcon = ICONSMALL('subdirectory_arrow_right');
  return (<>
    <TreeRow indent={indent + 1}>
      {continuation ? <Muted>{continuationIcon}</Muted> : null}
      {nodeRender}
    </TreeRow>
    {nextRender}
  </>);
});

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

export const FiberReactNode: React.FC<FiberNodeProps> = memo(({
  reactNode,
  expandCursor,
  first = false,
  indent = 0,
}) => {
  const nodeRender = <ReactNode reactNode={reactNode} root={first} />;
  
  const {child, sibling, _debugID} = reactNode;

  const childRender = child ? <FiberReactNode reactNode={child} expandCursor={expandCursor} indent={indent + (sibling ? 1 : .1)} /> : null;
  const siblingRender = sibling ? <FiberReactNode reactNode={sibling} expandCursor={expandCursor} indent={indent} /> : null;

  if (child) {
    return (
      <Expandable
        id={'react-' + _debugID}
        expandCursor={expandCursor}
        initialValue={true}
      >{
        (expand, onToggle) => (<>
          <TreeRow indent={indent}>
            <TreeExpand expand={expand} onToggle={onToggle}>
              {nodeRender}
            </TreeExpand>
          </TreeRow>
          {expand !== false ? childRender : null}
          {siblingRender}
        </>)
      }</Expandable>
    );  
  }

  return (<>
    <TreeRow indent={indent + 1}>
      {nodeRender}
    </TreeRow>
    {siblingRender}
  </>);
});
