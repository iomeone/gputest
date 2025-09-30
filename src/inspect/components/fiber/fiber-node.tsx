import type { LiveFiber } from '@use-gpu/live';
import type { Cursor } from '@use-gpu/state';
import type { InspectState, InspectAPI } from '../types'
import { isSubNode, DEBUG } from '@use-gpu/live';

import React, { memo, useMemo, useLayoutEffect, useRef } from 'react';

import { Expandable } from '../containers/expandable';
import { usePingTracker } from '../../providers/ping-provider';
import { TreeExpand } from '../tree/tree-expand';
import { TreeRow, TreeIndent, TreeLine, TreeRowOmitted } from '../tree/tree-layout';
import { ExpandState } from '../types';

import { Muted } from '../layout';
import { IconItem, SVGNextOpen, SVGNextClosed, SVGNextFence } from '../svg';

import { FiberDot } from './fiber-dot';
import { FiberBadge } from './fiber-badge';
import { FiberBadgeReact } from './fiber-badge-react';
import { FiberTag, getFiberTags } from './tag';

export type FiberNodeProps = {
  state: InspectState,
  api: InspectAPI,
  fiber: LiveFiber<any>,
  fibers: Map<number, LiveFiber<any>>,
  indent?: number,
  skipDepth?: number,
  focusDepth?: number,
  renderDepth?: number,
  depthLimit?: number,
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
  let by: number | undefined = fiber.by;

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

  depthLimit = Infinity,
  continuation,
  wide,
  indented = 1,
  indent = 0,
}) => {
  const {
    expandedCursor,
    optionsCursor,
    selectedState,
    hoveredState,
    focusedState,
    highlightState,
  } = state;

  // eslint-disable-next-line prefer-const
  let {id, mount, mounts, next, order, yeeted, __inspect} = fiber;

  const [optionsState] = optionsCursor();
  const {filterTags, runCounts, builtins} = optionsState;

  // Avoid jumpyness on hover
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const lockedWide = useMemo(() => (!mount && !mounts && !next), []);

  // Hook up ping provider
  fibers.set(fiber.id, fiber);

  // Resolve hover-state
  const selected = fiber === selectedState;
  const {fiber: hoverF, deps, precs, root} = highlightState;

  const hovered  = hoverF?.id ?? -1;
  const parents  = hoverF?.by === fiber.id;
  const depends  = deps?.indexOf(fiber.id) >= 0 || (root === fiber);
  const precedes = precs?.indexOf(fiber.id) >= 0 || (yeeted?.root === hoverF && yeeted?.value !== undefined);
  const quoted   = (
    (hoverF?.quote?.to === fiber) ||
    (hoverF && fiber?.quote?.to === hoverF)
  );
  const unquoted = (
    (hoverF?.unquote?.to === fiber) ||
    (hoverF && fiber?.unquote?.to === hoverF)
  );

  // Resolve depth-highlighting
  const subnode = highlightState.by ? isSubNode(highlightState.by, fiber) : true;
  const styleDepth = hoveredState.fiber ? (subnode ? Math.max(-1, renderDepth - hoveredState.depth) : -1) : 0;
  renderDepth = getRenderDepth(fibers, fiber) ?? renderDepth;

  // Resolve node omission
  const isFilteredOut = ((filterTags & FiberTag.All) != 0) && !(getFiberTags(fiber) & filterTags);
  const isFocused = !!focusDepth || ((focusedState != null) ? fiber.id === focusedState : true);
  const isBuiltin = !builtins && (fiber.f?.isLiveBuiltin || fiber.f?.isLiveReconcile || fiber.f?.isLiveQuote || fiber.f?.isLiveContinuation);
  const isVisible = (
    !isFilteredOut &&
    isFocused &&
    !skipDepth &&
    (renderDepth < depthLimit)
  );

  const shouldCollapseIntoParent = !wide && isBuiltin && !!fiber.next;

  const shouldDisplaySelf = !isBuiltin && isVisible;
  const [,, isPinned] = usePingTracker(fiber, shouldDisplaySelf && !!(filterTags & FiberTag.By));
  const shouldDisplay = shouldDisplaySelf || isPinned;

  const isSection = shouldDisplay && !shouldDisplaySelf && ((filterTags & FiberTag.All) != FiberTag.All);

  const shouldTerminate = (shouldCollapseIntoParent || fiber.f?.isLiveReconcile || fiber.f?.isLiveQuote || fiber.f?.isLiveContinuation) && isVisible;
  const shouldRender = shouldDisplay || shouldTerminate;

  const shouldAbsolute = !shouldRender && !!(parents || depends || precedes || quoted || unquoted);
  const shouldStartOpen = fiber.f !== DEBUG && !fiber.__inspect?.react;

  if (!skipDepth) {
    wide = wide || lockedWide;
    if (!shouldCollapseIntoParent) {
      indent += (indented * (wide ? 1 : .1));
    }
  }

  // Make click/hover handlers
  const {select, hover, unhover, focus} = useMemo(() => api.makeHandlers(fiber, renderDepth), [fiber, api, renderDepth]);

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
      section={isSection}
      runCount={runCounts}
      onClick={select}
      onDoubleClick={focus}
      onMouseEnter={hover}
      onMouseLeave={unhover}
      ref={rowRef}
      ooo={ooo}
      absolute={!!shouldAbsolute}
    />
  ) : (
    <FiberDot
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
      ref={rowRef}
      ooo={ooo}
      absolute={!!shouldAbsolute}
    />
  );

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
        depthLimit={depthLimit}
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
            depthLimit={depthLimit}
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
        depthLimit={depthLimit}
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
      <TreeRowOmitted indent={indent + 1} avoidOverlap={shouldAbsolute}>{badgeRender}</TreeRowOmitted>
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
          <TreeRow indent={indent} section={isSection}>
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
