import type { LiveFiber } from '@use-gpu/live';
import type { Cursor } from '@use-gpu/state';
import type { InspectState, InspectAPI } from './types'
import { isSubNode, DEBUG, RECONCILE, QUOTE, UNQUOTE } from '@use-gpu/live';

import React, { memo, useMemo, useLayoutEffect, useRef, PropsWithChildren } from 'react';

import { Expandable } from '../containers/expandable';
import { usePingTracker, usePingContext } from '../../providers/ping-provider';
import { TreeExpand } from '../tree/tree-expand';
import { TreeWrapper, TreeWrapperWithLegend, TreeBanner, TreeTip, TreeRow, TreeIndent, TreeLine, TreeToggle, TreeLegend, TreeLegendColumns,  TreeLegendGroup, TreeRowOmitted, TreeLegendItem } from '../tree/tree-layout';
import { ExpandState } from '../types';

import { Muted, InlineButton } from '../layout';
import { IconItem, SVGNextOpen, SVGNextClosed, SVGNextFence } from '../svg';

import { FiberBadge } from './fiber-badge';
import { FiberBadgeReact } from './fiber-badge-react';
import { getFiberTags } from './tag';

export type FiberNodeProps = {
  state: InspectState,
  api: InspectAPI,
  fiber: LiveFiber<any>,
  fibers: Map<number, LiveFiber<any>>,
  by?: LiveFiber<any> | null,
  indent?: number,
  skipDepth?: number,
  focusDepth?: number,
  renderDepth?: number,
  filterTags?: number,
  depthLimit?: number,
  runCounts?: boolean,
  builtins?: boolean,
  highlight?: boolean,
  continuation?: boolean,
  builtin?: boolean,
  wide?: boolean,
  indented?: number,
}

export type FiberReactNodeProps = {
  reactNode: any,
  expandedCursor: Cursor<ExpandState>,
  indent?: number,
  first?: boolean,
}

// Get rendered-by depth by tracing `by` props up the tree
const getRenderDepth = (fibers: Map<number, LiveFiber<any>>, fiber: LiveFiber<any>) => {
  let renderDepth = 0;
  let {by} = fiber;

  while (by) {
    const source = fibers.get(by);
    if (source?.next?.id !== fiber.id) renderDepth++;
    else return null;
    by = source?.by;
  }

  return renderDepth;
};

// One node in the tree
export const FiberNode: React.FC<FiberNodeProps> = memo(({
  state,
  api,
  fiber,
  fibers,
  focusDepth = 0,
  skipDepth = 0,
  renderDepth = 0,
  filterTags = 0,
  depthLimit = Infinity,
  runCounts = false,
  builtins = false,
  highlight = true,
  continuation,
  builtin,
  wide,
  indented = 1,
  indent = 0,
}) => {
  const {
    expandedCursor,
    selectedCursor,
    hoveredCursor,
    focusedCursor,
  } = state;

  // eslint-disable-next-line prefer-const
  let {id, mount, mounts, next, order, yeeted, __inspect} = fiber;
  const [selectState] = selectedCursor();
  const [hoverState] = hoveredCursor();
  const [focusState] = focusedCursor();

  // Avoid jumpyness on hover
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const lockedWide = useMemo(() => (!mount && !mounts && !next), []);

  // Hook up ping provider
  fibers.set(fiber.id, fiber);
  usePingTracker(fiber);

  // Resolve hover-state
  const selected = fiber === selectState;
  const {fiber: hoverF, deps, precs, root} = hoverState;

  const hovered  = hoverF?.id ?? -1;
  const parents  = hoverF?.by === fiber.id;
  const depends  = deps.indexOf(fiber.id) >= 0 || (root === fiber);
  const precedes = precs.indexOf(fiber.id) >= 0 || (yeeted?.root === hoverF && yeeted.value !== undefined);
  const quoted   = (
    (hoverF?.quote?.to === fiber) ||
    (hoverF && fiber?.quote?.to === hoverF)
  );
  const unquoted = (
    (hoverF?.unquote?.to === fiber) ||
    (hoverF && fiber?.unquote?.to === hoverF)
  );

  // Resolve depth-highlighting
  const subnode = hoverState.by ? isSubNode(hoverState.by, fiber) : true;
  const styleDepth = hoverState.fiber ? (subnode ? Math.max(-1, renderDepth - hoverState.depth) : -1) : 0;
  renderDepth = getRenderDepth(fibers, fiber) ?? renderDepth;

  // Resolve node omission
  const isFilteredOut = filterTags != 0 && !(getFiberTags(fiber) & filterTags);
  const isFocused = !!focusDepth || ((focusState != null) ? fiber.id === focusState : true);
  const isBuiltin = !builtins && (fiber.f?.isLiveBuiltin || fiber.f?.isLiveReconcile || fiber.f?.isLiveQuote || fiber.f?.isLiveContinuation);
  const isVisible = (
    !isFilteredOut &&
    isFocused &&
    !skipDepth &&
    (renderDepth < depthLimit)
  );

  const shouldCollapseIntoParent = !wide && isBuiltin && fiber.next;
  
  const shouldDisplay = !isBuiltin && isVisible;
  const shouldTerminate = (shouldCollapseIntoParent || fiber.f?.isLiveReconcile || fiber.f?.isLiveQuote || fiber.f?.isLiveContinuation) && isVisible;
  const shouldRender = shouldDisplay || shouldTerminate;

  const shouldAbsolute = !shouldRender && (parents || depends || precedes || quoted || unquoted);
  const shouldStartOpen = fiber.f !== DEBUG && !fiber.__inspect?.react;

  if (!skipDepth) {
    wide = wide || lockedWide;
    if (!shouldCollapseIntoParent) {
      indent += (indented * (wide ? 1 : .1));
    }
  }

  // Make click/hover handlers
  const {select, hover, unhover, focus} = useMemo(() => api.makeHandlers(fiber, fibers, renderDepth), [fiber, fibers, api, renderDepth]);

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
  const badgeRender = (shouldDisplay || shouldAbsolute) ? (
    <FiberBadge
      key={id}
      fiber={fiber}
      selected={selected}
      hovered={hovered}
      parents={parents}
      precedes={precedes}
      depends={depends}
      quoted={!!quoted}
      unquoted={!!unquoted}
      depth={styleDepth}
      runCount={runCounts}
      onClick={select}
      onDoubleClick={focus}
      onMouseEnter={hover}
      onMouseLeave={unhover}
      ref={rowRef}
      ooo={ooo}
      absolute={!!shouldAbsolute}
    />
  ) : null;

  // Render single child
  if (mount) {
    out.push(
      <FiberNode
        key='mount'
        state={state}
        api={api}
        fiber={mount}
        fibers={fibers}
        skipDepth={skipDepth && (skipDepth - 1)}
        focusDepth={isFocused ? focusDepth + 1 : 0}
        renderDepth={renderDepth}
        filterTags={filterTags}
        depthLimit={depthLimit}
        runCounts={runCounts}
        builtins={builtins}
        highlight={highlight}
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
            state={state}
            api={api}
            fiber={sub}
            fibers={fibers}
            skipDepth={skipDepth && (skipDepth - 1)}
            focusDepth={isFocused ? focusDepth + 1 : 0}
            renderDepth={renderDepth}
            filterTags={filterTags}
            depthLimit={depthLimit}
            runCounts={runCounts}
            builtins={builtins}
            highlight={highlight}
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
          expandedCursor={expandedCursor}
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
        state={state}
        api={api}
        fiber={next}
        fibers={fibers}
        skipDepth={skipDepth && (skipDepth - 1)}
        focusDepth={isFocused ? focusDepth + 1 : 0}
        renderDepth={renderDepth}
        filterTags={filterTags}
        depthLimit={depthLimit}
        runCounts={runCounts}
        builtins={builtins}
        highlight={highlight}
        indented={0}
        wide={true}
        indent={indent}
        continuation
        builtin={fiber.f?.isLiveBuiltin}
      />
    );
  }

  // Compact omitted row
  if (!shouldRender) {
    if (skipDepth) return childRender;
    return (<>
      <TreeRowOmitted indent={indent + 1}>{badgeRender}</TreeRowOmitted>
      {childRender}
      {nextRender}
    </>);
  }

  // Collapsed row
  if (shouldCollapseIntoParent) {
    return (<>
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
        expandedCursor={expandedCursor}
        initialValue={shouldStartOpen}
      >{
        (expand, onToggle) => (<>
          <TreeRow indent={indent}>
            <TreeExpand expand={expand} onToggle={onToggle} openIcon={openIcon} closedIcon={closedIcon}>
              {badgeRender}
            </TreeExpand>
          </TreeRow>
          {expand !== false ? childRender : null}
          {nextRender}
        </>)
      }</Expandable>
    );
  }

  // Leaf node
  return (<>
    <TreeRow indent={indent + 1 - +!!continuation}>
      {continuation ? (
        <Muted            onClick={select}
            onDoubleClick={focus}
            onMouseEnter={hover}
            onMouseLeave={unhover}
>
          <IconItem>
            <SVGNextFence />
          </IconItem>
        </Muted>
      ) : null}
      {badgeRender}
    </TreeRow>
    {nextRender}
  </>);
});

export const FiberReactNode: React.FC<FiberReactNodeProps> = memo(({
  reactNode,
  expandedCursor,
  first = false,
  indent = 0,
}) => {
  const badgeRender = <FiberBadgeReact reactNode={reactNode} root={first} />;

  const {child, sibling, _debugID} = reactNode;

  const childRender = child ? <FiberReactNode reactNode={child} expandedCursor={expandedCursor} indent={indent + (sibling ? 1 : .1)} /> : null;
  const siblingRender = sibling ? <FiberReactNode reactNode={sibling} expandedCursor={expandedCursor} indent={indent} /> : null;

  if (child) {
    return (
      <Expandable
        id={'react-' + _debugID}
        expandedCursor={expandedCursor}
        initialValue={true}
      >{
        (expand, onToggle) => (<>
          <TreeRow indent={indent}>
            <TreeExpand expand={expand} onToggle={onToggle}>
              {badgeRender}
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
      {badgeRender}
    </TreeRow>
    {siblingRender}
  </>);
});
