import type { LiveFiber } from '@use-gpu/live';
import type { Cursor } from '@use-gpu/state';
import type { InspectState, InspectAPI } from './types'
import { formatValue, isSubNode, YEET, DEBUG, RECONCILE } from '@use-gpu/live';

import React, { memo, useMemo, useLayoutEffect, useRef, PropsWithChildren } from 'react';

import { usePingTracker, usePingContext } from '../providers/ping-provider';
import { Node } from './node';
import { ReactNode } from './react-node';
import { ExpandState, SelectState, HoverState, FocusState, Action } from './types';

import { TreeWrapper, TreeWrapperWithLegend, TreeBanner, TreeTip, TreeRow, TreeIndent, TreeLine, TreeToggle, TreeLegend, TreeLegendColumns, TreeLegendGroup, TreeRowOmitted, TreeLegendItem, SplitColumn, SplitColumnFull, Muted, InlineButton } from './layout';
import { Expandable } from './expandable';

import { IconItem, SVGChevronDown, SVGChevronLeft, SVGChevronRight, SVGNextOpen, SVGNextClosed, SVGAtom, SVGHighlightElement, SVGYeet, SVGQuote, SVGDashboard, SVGViewOutput } from './svg';

type FiberTreeProps = {
  state: InspectState,
  api: InspectAPI,
  fiber: LiveFiber<any>,
  skipDepth: number,
  depthLimit: number,
  runCounts: boolean,
  builtins: boolean,
  highlight: boolean,
  legend: boolean,
}

type FiberNavProps = {
  state: InspectState,
  api: InspectAPI,
};

type FiberNodeProps = {
  state: InspectState,
  api: InspectAPI,
  fiber: LiveFiber<any>,
  fibers: Map<number, LiveFiber<any>>,
  by?: LiveFiber<any> | null,
  indent?: number,
  skipDepth?: number,
  focusDepth?: number,
  renderDepth?: number,
  depthLimit?: number,
  runCounts?: boolean,
  builtins?: boolean,
  highlight?: boolean,
  continuation?: boolean,
  builtin?: boolean,
  wide?: boolean,
  indented?: number,
}

type FiberReactNodeProps = {
  reactNode: any,
  expandedCursor: Cursor<ExpandState>,
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

export const FiberNav: React.FC<FiberNavProps> = (props: FiberNavProps) => {
  const {api: {focusFiber}, state: {focusedCursor}} = props;
  const [focusState] = focusedCursor();
  const back = focusState ? (
    <TreeBanner>
      <InlineButton className="icon-left" onClick={() => focusFiber(null)}>
        <IconItem top={0}><SVGChevronLeft /></IconItem> Back to root
      </InlineButton>
    </TreeBanner>
  ) : null;
  return back;
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
      <TreeLegendColumns>
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
              parents={true}
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
      </TreeLegendColumns>
      <TreeTip><Muted>Double click to focus a sub-tree</Muted></TreeTip>
    </div></TreeLegend>
  </>)
};

// Fiber tree including legend
export const FiberTree: React.FC<FiberTreeProps> = ({
  state,
  api,
  fiber,
  skipDepth,
  depthLimit,
  runCounts,
  builtins,
  highlight,
  legend,
}) => {
  const {fibers} = usePingContext();
  const by = fibers.get(fiber.by);
  const [focusedId] = state.focusedCursor();

  const Wrap = legend ? TreeWrapperWithLegend : TreeWrapper;

  return (
    <Wrap style={{paddingTop: focusedId ? 0 : undefined}}>
      <FiberNode
        state={state}
        api={api}
        by={by}
        fiber={fiber}
        fibers={fibers}
        renderDepth={0}
        skipDepth={skipDepth}
        focusDepth={0}
        depthLimit={depthLimit}
        runCounts={runCounts}
        builtins={builtins}
        highlight={highlight}
      />
      {(legend ?? true) ? <FiberLegend /> : null}
    </Wrap>
  );
}

// One node in the tree
export const FiberNode: React.FC<FiberNodeProps> = memo(({
  state,
  api,
  by,
  fiber,
  fibers,
  focusDepth = 0,
  skipDepth = 0,
  renderDepth = 0,
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

  let {id, mount, mounts, next, order, host, yeeted, __inspect} = fiber;
  const [selectState] = selectedCursor();
  const [hoverState] = hoveredCursor();
  const [focusState] = focusedCursor();

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
  const isFocused = !!focusDepth || ((focusState != null) ? fiber.id === focusState : true);
  const isBuiltin = !builtins && (fiber.f?.isLiveBuiltin || fiber.f?.isLiveReconcile) && (fiber.f !== RECONCILE);
  const isVisible = (
    isFocused &&
    !skipDepth &&
    (renderDepth < depthLimit)
  );
  const shouldRender = !isBuiltin && isVisible;
  const shouldTerminate = fiber.f?.isLiveReconcile && !builtin && isVisible;
  const shouldAbsolute = !shouldRender && (parents || depends || precedes || quoted || unquoted);
  const shouldStartOpen = fiber.f !== DEBUG && !fiber.__inspect?.react;

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
  let nodeRender = (shouldRender || shouldAbsolute) ? (
    <Node
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
  //if (shouldAbsolute) nodeRender = <div style={{position: 'absolute'}}>{nodeRender}</div>;

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
  if (!shouldRender && !shouldTerminate) {
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
        expandedCursor={expandedCursor}
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
  expandedCursor,
  first = false,
  indent = 0,
}) => {
  const nodeRender = <ReactNode reactNode={reactNode} root={first} />;

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
