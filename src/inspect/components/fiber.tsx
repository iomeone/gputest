import type { LiveFiber } from '@use-gpu/live';
import type { Cursor } from '@use-gpu/state';
import { formatValue, isSubNode, YEET, DEBUG } from '@use-gpu/live';

import React, { memo, useMemo, useLayoutEffect, useRef, PropsWithChildren } from 'react';

import { useRefineCursor } from '@use-gpu/state';
import { usePingTracker, usePingContext } from '../providers/ping-provider';
import { Node } from './node';
import { ReactNode } from './react-node';
import { ExpandState, SelectState, HoverState, Action } from './types';

import { TreeWrapper, TreeWrapperWithLegend, TreeRow, TreeIndent, TreeLine, TreeToggle, TreeLegend, TreeLegendGroup, TreeRowOmitted, TreeLegendItem, SplitColumn, SplitColumnFull, Muted } from './layout';
import { Expandable } from './expandable';

import { IconItem, SVGChevronDown, SVGChevronRight, SVGNextOpen, SVGNextClosed, SVGAtom, SVGHighlightElement, SVGYeet, SVGQuote, SVGDashboard, SVGViewOutput } from './svg';

type FiberTreeProps = {
  fiber: LiveFiber<any>,
  skipDepth: number,
  depthLimit: number,
  runCounts: boolean,
  builtins: boolean,
  highlight: boolean,
  legend: boolean,
  expandCursor: Cursor<ExpandState>,
  selectedCursor: Cursor<SelectState>,
  hoveredCursor: Cursor<HoverState>,
}

type FiberNodeProps = {
  fiber: LiveFiber<any>,
  fibers: Map<number, LiveFiber<any>>,
  by?: LiveFiber<any> | null,
  expandCursor: Cursor<ExpandState>,
  selectedCursor: Cursor<SelectState>,
  hoveredCursor: Cursor<HoverState>,
  indent?: number,
  skipDepth?: number,
  renderDepth?: number,
  depthLimit?: number,
  runCounts?: boolean,
  builtins?: boolean,
  highlight?: boolean,
  continuation?: boolean,
  wide?: boolean,
  indented?: number,
}

type FiberReactNodeProps = {
  reactNode: any,
  expandCursor: Cursor<ExpandState>,
  indent?: number,
  first?: boolean,
}

type TreeExpandProps = PropsWithChildren<{
  expand: boolean,
  onToggle: (e: any) => void,
  openIcon?: any,
  closedIcon?: any,
}>;

// Get rendered-by depth by tracing `by` props up the tree
const getRenderDepth = (fibers: Map<number, LiveFiber<any>>, fiber: LiveFiber<any>) => {
  let renderDepth = 0;
  let {by} = fiber;
  while (by) {
    const source = fibers.get(by);
    if (source && source.next?.id !== fiber.id) renderDepth++;
    else return null;
    by = source?.by;
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
    <TreeLegend><div>
      <TreeLegendGroup>
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
      </TreeLegendGroup>

      <TreeLegendGroup>
        <TreeLegendItem>
          <Node
            fiber={fiber}
            depends={true}
          />
          <span>Dependency</span>
        </TreeLegendItem>
        <TreeLegendItem>
          <Node
            fiber={fiber}
            quoted={true}
          />
          <span>Portal</span>
        </TreeLegendItem>
      </TreeLegendGroup>

      <TreeLegendGroup>
        <TreeLegendItem>
          <IconItem gap={-5} top={-2}><SVGYeet /></IconItem>
          <span>Yeet</span>
        </TreeLegendItem>

        <TreeLegendItem>
          <IconItem gap={-5} top={-2}><SVGQuote /></IconItem>
          <span>Quote</span>
        </TreeLegendItem>

        <TreeLegendItem>
          <IconItem gap={-5} top={-2}><SVGHighlightElement /></IconItem>
          <span>Highlight</span>
        </TreeLegendItem>
      </TreeLegendGroup>

      <TreeLegendGroup>
        <TreeLegendItem>
          <IconItem gap={-5} top={-2}><SVGViewOutput /></IconItem>
          <span>Output</span>
        </TreeLegendItem>

        <TreeLegendItem>
          <IconItem gap={-5} top={-2}><SVGDashboard /></IconItem>
          <span>Layout</span>
        </TreeLegendItem>

        <TreeLegendItem>
          <IconItem gap={-5} top={-2}><SVGAtom /></IconItem>
          <span>React</span>
        </TreeLegendItem>
      </TreeLegendGroup>
    </div></TreeLegend>
  </>)
};

// Fiber tree including legend
export const FiberTree: React.FC<FiberTreeProps> = ({
  fiber,
  skipDepth,
  depthLimit,
  runCounts,
  builtins,
  highlight,
  legend,
  expandCursor,
  selectedCursor,
  hoveredCursor,
}) => {
  const {fibers} = usePingContext();
  const by = fibers.get(fiber.by);
  
  const Wrap = legend ? TreeWrapperWithLegend : TreeWrapper;
  
  return (<>
    <Wrap>
      <FiberNode
        by={by}
        fiber={fiber}
        fibers={fibers}
        renderDepth={0}
        skipDepth={skipDepth}
        depthLimit={depthLimit}
        runCounts={runCounts}
        builtins={builtins}
        highlight={highlight}
        expandCursor={expandCursor}
        selectedCursor={selectedCursor}
        hoveredCursor={hoveredCursor}
      />
      {(legend ?? true) ? <FiberLegend /> : null}
    </Wrap>
  </>);
}

// One node in the tree
export const FiberNode: React.FC<FiberNodeProps> = memo(({
  by,
  fiber,
  fibers,
  skipDepth = 0,
  renderDepth = 0,
  depthLimit = Infinity,
  runCounts = false,
  builtins = false,
  highlight = true,
  expandCursor,
  selectedCursor,
  hoveredCursor,
  continuation,
  wide,
  indented = 1,
  indent = 0,
}) => {
  let {id, mount, mounts, next, order, host, yeeted, __inspect} = fiber;
  const [selectState, updateSelectState] = selectedCursor;
  const [hoverState, updateHoverState] = hoveredCursor;

  // Avoid jumpyness on hover
  const lockedWide = useMemo(() => (!mount && !mounts && !next), []);
  if (!skipDepth) {
    wide = wide || lockedWide;
    indent += (indented * (wide ? 1 : .1));
  }

  // Hook up ping provider
  fibers.set(fiber.id, fiber);
  usePingTracker(fiber);

  // Resolve hover-state
  const selected = fiber === selectState;
  const hovered  = hoverState.fiber?.id ?? -1;
  const parents  = hoverState.fiber?.by === fiber.id;
  const depends  = hoverState.deps.indexOf(fiber.id) >= 0 || (hoverState.root === fiber);
  const precedes = hoverState.precs.indexOf(fiber.id) >= 0 || (yeeted?.root === hoverState.fiber && yeeted.value !== undefined);
  const quoted   = hoverState.fiber?.quote?.to === fiber || fiber?.quote?.to === hoverState.fiber;
  const unquoted = hoverState.fiber?.unquote?.to === fiber || !!(hoverState.fiber && fiber?.unquote?.to === hoverState.fiber);

  // Resolve depth-highlighting
  const subnode = hoverState.by ? isSubNode(hoverState.by, fiber) : true;
  const styleDepth = hoverState.fiber ? (subnode ? Math.max(-1, renderDepth - hoverState.depth) : -1) : 0;
  renderDepth = getRenderDepth(fibers, fiber) ?? renderDepth;

  // Resolve node omission
  const shouldRender = !skipDepth && (renderDepth < depthLimit) && (builtins || !fiber.f?.isLiveBuiltin);
  const shouldAbsolute = !shouldRender && (parents || depends || precedes || quoted || unquoted);
  const shouldStartOpen = fiber.f !== DEBUG && !fiber.__inspect?.react;

  // Make click/hover handlers
  const [select, hover, unhover] = useMemo(() => {
    const root = () => fiber.yeeted && fiber.type === YEET ? fiber.yeeted.root : null;

    const select  = () => updateSelectState({ $set: fiber });
    const hover   = () => updateHoverState({ $set: {
      fiber,
      by: fibers.get(fiber.by) ?? null,
      deps: host ? Array.from(host.traceDown(fiber)).map(f => f.id) : [],
      precs: host ? Array.from(host.traceUp(fiber)) : [],
      root: root(),
      depth: renderDepth,
    } });
    const unhover = (e: any) => e.altKey || updateHoverState({ $set: {
      fiber: null,
      by: null,
      deps: [],
      precs: [],
      root: null,
      depth: 0,
    } });
    return [select, hover, unhover];
  }, [fiber, updateSelectState, updateHoverState]);

  const rowRef = useRef<HTMLDivElement>(null);
  const out = [] as React.ReactElement[];

  useLayoutEffect(() => {
    const {current: row} = rowRef;
    if (selected && row) {
      const rect = row.getBoundingClientRect();

      let parent = row as HTMLElement | null;
      while (parent) {
        if (parent.classList.contains('tree-scroller')) break;
        parent = parent.parentElement;
      }
      if (parent) {
        const container = parent.getBoundingClientRect();

        if (rect.left < container.left || rect.right > container.right) {
          parent.scrollLeft += rect.left - container.left - 50;
        }
        
        if (rect.top < container.top || rect.bottom > container.bottom) {
          parent.scrollTop += rect.top - container.top - 150;
        }
      }
    }
  }, [selected]);
  
  let ooo = false;
  if (mounts && order) {
    if (order.length !== mounts.size) {
      order = [...mounts.keys()];
      ooo = true;
    }
  }

  // Render node itself
  let nodeRender = (shouldRender || shouldAbsolute) ? (
    <Node
      key={id}
      fiber={fiber}
      selected={selected}
      hovered={hovered}
      parents={parents}
      precedes={precedes}
      depends={depends}
      quoted={quoted}
      unquoted={unquoted}
      depth={styleDepth}
      runCount={runCounts}
      onClick={select}
      onMouseEnter={hover}
      onMouseLeave={unhover}
      ref={rowRef}
      ooo={ooo}
    />
  ) : null;
  if (shouldAbsolute) nodeRender = <div style={{position: 'absolute'}}>{nodeRender}</div>;

  // Render single child   
  if (mount) {
    out.push(
      <FiberNode
        key='mount'
        fiber={mount}
        fibers={fibers}
        skipDepth={skipDepth && (skipDepth - 1)}
        renderDepth={renderDepth}
        depthLimit={depthLimit}
        runCounts={runCounts}
        builtins={builtins}
        highlight={highlight}
        expandCursor={expandCursor}
        selectedCursor={selectedCursor}
        hoveredCursor={hoveredCursor}
        indent={indent}
        indented={+!!shouldRender}
        wide={!!next}
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
            skipDepth={skipDepth && (skipDepth - 1)}
            renderDepth={renderDepth}
            depthLimit={depthLimit}
            runCounts={runCounts}
            builtins={builtins}
            highlight={highlight}
            expandCursor={expandCursor}
            selectedCursor={selectedCursor}
            hoveredCursor={hoveredCursor}
            indent={indent}
            indented={+!!shouldRender}
            wide={order.length > 1 || !!next}
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
        skipDepth={skipDepth && (skipDepth - 1)}
        renderDepth={renderDepth}
        depthLimit={depthLimit}
        runCounts={runCounts}
        builtins={builtins}
        highlight={highlight}
        expandCursor={expandCursor}
        selectedCursor={selectedCursor}
        hoveredCursor={hoveredCursor}
        indented={0}
        wide={true}
        indent={indent}
        continuation
      />
    );
  }

  // Compact omitted row
  if (!shouldRender) {
    if (skipDepth) return childRender;
    return (<>
      <TreeRowOmitted indent={indent + 1}>{nodeRender}</TreeRowOmitted>
      {childRender}
      {nextRender}
    </>);
  }
  
  // Expandable node
  if (out.length) {
    const openIcon = continuation ? <SVGNextOpen /> : undefined;
    const closedIcon = continuation ? <SVGNextClosed /> : undefined;
    return (
      <Expandable
        id={id}
        expandCursor={expandCursor}
        initialValue={shouldStartOpen}
      >{
        (expand, onToggle) => (<>
          <TreeRow indent={indent}>
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
  const continuationIcon = <IconItem><SVGNextClosed /></IconItem>;
  return (<>
    <TreeRow indent={indent + 1 - +!!continuation}>
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
  openIcon = <SVGChevronDown />,
  closedIcon = <SVGChevronRight />,
}) => {
  const icon = <IconItem>{expand !== false ? openIcon : closedIcon}</IconItem>;

  return (<>
    <TreeRow>
      <TreeToggle onClick={onToggle}>{icon}</TreeToggle>
      {children}
    </TreeRow>
  </>);
}

export const FiberReactNode: React.FC<FiberReactNodeProps> = memo(({
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
