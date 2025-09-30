import type { LiveFiber } from '@use-gpu/live';
import type { ExpandState, SelectState, HoverState, OptionState, FocusState, PingState, InspectAppearance, InspectState, InspectAPI } from './types';

import { formatNode, formatValue, YEET } from '@use-gpu/live';
import { useUpdateState, useCursor } from '@use-gpu/state/react';
import { Cursor, $apply } from '@use-gpu/state';

import React, { memo, useCallback, useLayoutEffect, useEffect, useMemo, useState, SetStateAction } from 'react';

import { makeUseLocalState } from '../hooks/useLocalState';
import { PingProvider, usePingContext } from '../providers/ping-provider';
import { useAppearance } from '../providers/appearance-provider';

import { Node } from './node';
import { FiberTree, FiberNav } from './fiber';
import { Options } from './options';
import { Panels } from './panels';
import { Resizer } from './resizer';
import { IconItem, SVGInspect, SVGPickElement, SVGClose } from './svg';
import {
  InspectContainer, InspectToggle, Button, SmallButton, TreeControls, TreeView, Spacer, Grow,
  SplitRow, RowPanel, Panel, PanelFull, PanelAbsolute, PanelScrollable, Inset, InsetColumnFull,
} from './layout';

const getOptionsKey = (id: string, sub: string = 'root') => `liveInspect[${sub}][${id}]`;

const INITIAL_STATE = {
  open: false,
  depth: 1000,
  counts: false,
  fullSize: false,
  builtins: false,
  highlight: true,
  inspect: false,
  tab: 'props',
  splitLeft: 33,
  splitBottom: 50,
};

type InspectFiber = Record<string, any>;
type InspectMap = WeakMap<LiveFiber<any>, InspectFiber>;

type InspectProps = {
  fiber: LiveFiber<any>,
  sub?: string,
  onInspect?: (b: boolean) => void,

  findFiber?: number,
  appearance?: Partial<InspectAppearance>,
  initialState?: Partial<OptionState>,
  save?: boolean,
}

const NOP = () => {};

export const Inspect: React.FC<InspectProps> = ({
  fiber,
  sub,
  onInspect,
  findFiber,
  initialState,
  appearance,
  save = true,
}) => {
  const {close, toolbar, legend, resize, skip, select} = useAppearance();

  const expandedCursor = useCursor(useUpdateState<ExpandState>({}));
  const selectedCursor = useCursor(useUpdateState<SelectState>(null));
  const optionCursor = useCursor(useUpdateState<OptionState>(
    {
      ...INITIAL_STATE,
      ...initialState,
    },
    save ? makeUseLocalState(
      getOptionsKey('state', sub),
      (obj: any) => ({...INITIAL_STATE, ...obj}),
    ) : useState
  ));
  const hoveredCursor = useCursor(useUpdateState<HoverState>(() => ({
    fiber: null, by: null, deps: [], precs: [], root: null, depth: 0,
  })));
  const focusedCursor = useCursor(useUpdateState<FocusState>(null));

  const state = useMemo(() => ({
    expandedCursor,
    selectedCursor,
    hoveredCursor,
    focusedCursor,
  }), [expandedCursor, selectedCursor, hoveredCursor, focusedCursor]);

  let [selectedFiber, updateSelected] = selectedCursor();
  const [depthLimit] = optionCursor.depth();
  const [runCounts] = optionCursor.counts();
  const [fullSize] = optionCursor.fullSize();
  const [builtins] = optionCursor.builtins();
  const [highlight] = optionCursor.highlight();
  const [tab, updateTab] = optionCursor.tab();
  const [splitLeft, setSplitLeft] = optionCursor.splitLeft();
  const [splitBottom, setSplitBottom] = optionCursor.splitBottom();
  const [inspect, updateInspect] = optionCursor.inspect();
  const [{fiber: hoveredFiber}, updateHovered] = hoveredCursor();
  const [focusedId, updateFocused] = focusedCursor();

  if (!select) selectedCursor()[1] = updateSelected = NOP;

  const setSelected = useCallback((fiber?: LiveFiber<any> | null) => {
    updateSelected({ $set: fiber ?? null });
  }, [updateSelected, select]);

  const [open, updateOpen] = optionCursor.open();
  const toggleOpen = () => updateOpen(!open);
  const toggleInspect = useCallback(() => {
    updateInspect($apply(s => {
      onInspect && onInspect(!s);
      return !s;
    }));
  }, [onInspect]);

  useLayoutEffect(() => {
    const el = document.querySelector('#use-gpu .canvas');
    if (!el || !open) return;

    (el as any).style.left = splitLeft + '%';
    return () => {
      (el as any).style.left = '0';
    };
  }, [open, splitLeft]);

  useLayoutEffect(() => {
    const setHovered = hoveredFiber?.__inspect?.setHovered;
    if (!setHovered || !highlight) return;

    setHovered(true);
    return () => setHovered(false);
  }, [hoveredFiber, highlight])

  const rootId = fiber.id;

  const api: InspectAPI = useMemo(() => {

    const selectFiber = (fiber: LiveFiber<any> | null = null) =>
      updateSelected({ $set: fiber });

    const focusFiber = (fiber: LiveFiber<any> | null = null) => {
      const id = fiber?.id;
      updateFocused(id != null && id !== rootId ? id : null);
    };

    const hoverFiber = (
      fiber: LiveFiber<any> | null = null,
      fibers: Map<number, LiveFiber<any>> | null,
      renderDepth: number = 0,
      sticky?: boolean,
    ) =>
      updateHovered($apply(prev => {
        if (sticky && prev.fiber) return prev;
        if (fiber) return {
          fiber,
          by: fibers?.get(fiber.by) ?? null,
          deps: fiber.host ? Array.from(fiber.host.traceDown(fiber)).map(f => f.id) : [],
          precs: fiber.host ? Array.from(fiber.host.traceUp(fiber)) : [],
          root: fiber.yeeted && fiber.type === YEET ? fiber.yeeted.root : null,
          depth: renderDepth,
        };

        return {
          fiber: null,
          by: null,
          deps: [],
          precs: [],
          root: null,
          depth: 0,
        };
      }));

    const makeHandlers = (fiber: LiveFiber<any>, fibers: Map<number, LiveFiber<any>>, renderDepth: number = 0) => {
      const select = () => selectFiber(fiber);
      const hover = (e: MouseEvent) => hoverFiber(fiber, fibers, renderDepth, e.altKey);
      const unhover = (e: MouseEvent) => hoverFiber(null, null, 0, e.altKey);
      const focus = () => focusFiber(fiber);

      return {select, hover, unhover, focus};
    }

    return {selectFiber, focusFiber, hoverFiber, makeHandlers};
  }, [updateSelected, updateFocused, updateHovered]);

  const tree = (
    <InsetColumnFull>
      {(toolbar ?? true)  ? (
        <TreeControls>
          <Options cursor={optionCursor} toggleInspect={onInspect && toggleInspect} />
        </TreeControls>
      ) : null}
      <FiberNav state={state} api={api} />
      <TreeView key={focusedId} onClick={() => updateSelected(null)} onDoubleClick={() => updateFocused(null)}>
        <FiberTree
          state={state}
          api={api}
          fiber={fiber}
          legend={legend}
          skipDepth={skip}
          depthLimit={depthLimit}
          runCounts={runCounts}
          builtins={builtins}
          highlight={highlight}
        />
      </TreeView>
    </InsetColumnFull>
  );

  // Avoid text selection on double click
  const onMouseDown = (e: any) => {
    if (e.detail > 1) {
      e.preventDefault();
    }
  };

  return (<div className="LiveInspect">
    {open ? (
      <PingProvider fiber={fiber}>
        <HostHighlight fiber={fiber} findFiber={findFiber} toggleInspect={toggleInspect} api={api} />
        <InspectContainer onMouseDown={onMouseDown} className="ui inverted">
          <div style={fullSize
              ? {display: 'flex', flexDirection: 'column', width: '100%', minHeight: 0, height: '100%', maxHeight: '100%', flexGrow: 1}
              : {display: 'flex', height: '100%'}}>
            <RowPanel style={fullSize
                ? {position: 'relative', flexGrow: 1, minHeight: 0}
                : {position: 'relative', width: splitLeft + '%', borderRight: '1px solid var(--LiveInspect-borderThin'}}>
              <PanelAbsolute>
                {tree}
              </PanelAbsolute>
              {resize && !fullSize ? <Resizer side="right" value={splitLeft} onChange={setSplitLeft} /> : null}
            </RowPanel>
            {selectedFiber ? (
              <RowPanel style={fullSize
                  ? {position: 'relative', height: splitBottom + '%', zIndex: 10, flexShrink: 0, background: '#000', borderTop: '1px solid var(--LiveInspect-borderThin' }
                  : {width: (100 - splitLeft) + '%'}
                }>
                <PanelScrollable>
                  <Panels fiber={selectedFiber} api={api} fullSize={fullSize} tab={tab} onTab={updateTab} />
                </PanelScrollable>
                {resize && fullSize ? <Resizer side="top" value={splitBottom} onChange={setSplitBottom} /> : null}
              </RowPanel>
            ) : null}
          </div>
        </InspectContainer>
      </PingProvider>
    ) : null}
    {(close ?? true) ? (
      <InspectToggle onClick={toggleOpen}>
        <Button style={{width: 58, height: 37}}>{open
          ? <IconItem height={20} top={-2}><SVGClose size={20} /></IconItem>
          : <IconItem height={20} top={-4}><SVGInspect size={24} /></IconItem>
        }</Button>
      </InspectToggle>
    ) : null}
  </div>);
}

type HostHighlightProps = {
  fiber: LiveFiber<any>,
  findFiber?: number,
  toggleInspect: () => void,
  api: InspectAPI,
};

const HostHighlight = (props: HostHighlightProps) => {
  const {api, fiber, findFiber, toggleInspect} = props;
  const {fibers} = usePingContext();

  const {host} = fiber;
  useLayoutEffect(() => {
    if (!host) return;

    host.__highlight = (id: number | null, active?: boolean) => {
      const fiber = fibers.get(id ?? 0);
      if (fiber) {
        if (active) {
          toggleInspect();
          return api.selectFiber(fiber);
        }

        api.hoverFiber(fiber, fibers);
      }
      else {
        api.hoverFiber(null, fibers);
      }
    };

    return () => { host.__highlight = () => {}; }
  }, [host, fibers, api]);

  useEffect(() => {
    const find = fibers.get(findFiber!);
    if (find) api.selectFiber(find);
  }, [findFiber, api]);

  return null;
};
