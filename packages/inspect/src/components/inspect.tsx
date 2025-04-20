import type { LiveFiber } from '@use-gpu/live';
import type { ExpandState, SelectState, HoverState, OptionsState, FocusState, InspectAPI } from './types';

import { YEET, incrementVersion } from '@use-gpu/live';
import { useUpdateState, useCursor } from '@use-gpu/state/react';
import { $apply } from '@use-gpu/state';

import React, { useCallback, useLayoutEffect, useEffect, useMemo, useState } from 'react';

import { makeUseLocalState } from '../hooks/useLocalState';
import { PingProvider } from '../providers/ping-provider';
import { useAppearance } from '../providers/appearance-provider';

import { FiberTag, getFiberTags } from './fiber/tag';

import { FiberTree } from './fiber/fiber-tree';
import { ToolbarFilter } from './toolbar/toolbar-filter';
import { ToolbarNav } from './toolbar/toolbar-nav';
import { SidebarPanel, ToolbarRow } from './panels/panels-layout';

import { ToolbarOptions } from './toolbar/toolbar-options';
import { Panels } from './panels/panels';
import { Resizer } from './resizer';
import { IconItem, SVGInspect, SVGClose } from './svg';
import {
  InspectContainer, InspectToggle, Button,
  RowPanel, PanelAbsolute, PanelScrollable, InsetColumnFull,
} from './layout';

const getOptionsKey = (id: string, sub: string = 'root') => `liveInspect[${sub}][${id}]`;

const INITIAL_STATE = {
  open: false,
  depthLimit: 1000,
  runCounts: false,
  fullSize: false,
  builtins: false,
  highlight: true,
  inspect: false,
  tab: 'props',
  preferredTab: 'props',
  splitLeft: 33,
  splitBottom: 50,
  filterTags: FiberTag.All ^ FiberTag.Other ^ FiberTag.By ^ FiberTag.Yeet ^ FiberTag.Quote,
};

const NO_HOVER = {
  fiber: null, by: null, deps: [], precs: [], root: null, depth: 0,
};

type InspectProps = {
  fiber: LiveFiber<any>,
  sub?: string,
  onInspect?: (b: boolean) => void,

  findFiber?: number,
  initialState?: Partial<OptionsState>,
  save?: boolean,
}

const NOP = () => {};

export const Inspect: React.FC<InspectProps> = ({
  fiber,
  sub,
  onInspect,
  findFiber,
  initialState,
  save = true,
}) => {
  const {close, toolbar, legend, resize, skip, select} = useAppearance();

  const fibers = useMemo(() => new Map<number, LiveFiber<any>>(), []);

  const expandedCursor = useCursor(useUpdateState<ExpandState>({}));
  const selectedCursor = useCursor(useUpdateState<SelectState>(null));
  const optionsCursor = useCursor(useUpdateState<OptionsState>(
    {
      ...INITIAL_STATE,
      ...initialState,
    },
    save ? makeUseLocalState(
      getOptionsKey('state', sub),
      (obj: any) => ({...INITIAL_STATE, ...obj}),
    ) : useState
  ));
  const hoveredCursor = useCursor(useUpdateState<HoverState>(() => NO_HOVER));
  const focusedCursor = useCursor(useUpdateState<FocusState>(null));

  // eslint-disable-next-line prefer-const
  let [selectedFiber, updateSelected] = selectedCursor();
  const [{fiber: hoveredFiber}, updateHovered] = hoveredCursor();

  const highlightState = useMemo(() => {
    const fiber = hoveredFiber ?? selectedFiber;
    if (!fiber) return NO_HOVER;
    return {
      fiber,
      by: fibers.get(fiber.by) ?? null,
      deps: fiber.host ? Array.from(fiber.host.traceDown(fiber)).map(f => f.id) : [],
      precs: fiber.host ? Array.from(fiber.host.traceUp(fiber)) : [],
      root: fiber.yeeted && fiber.type === YEET ? fiber.yeeted.root : null,
    };    
  }, [selectedFiber, hoveredFiber, fibers]);

  const [version, setVersion] = useState(0);
  const [fullSize] = optionsCursor.fullSize();
  const [highlight] = optionsCursor.highlight();

  const [tab, updateTab] = optionsCursor.tab();
  const [preferredTab, updatePreferredTab] = optionsCursor.preferredTab();
  const [splitLeft, setSplitLeft] = optionsCursor.splitLeft();
  const [splitBottom, setSplitBottom] = optionsCursor.splitBottom();
  const [, updateInspect] = optionsCursor.inspect();
  const [focusedId, updateFocused] = focusedCursor();

  if (!select) selectedCursor()[1] = updateSelected = NOP;

  const [open, updateOpen] = optionsCursor.open();
  const toggleOpen = () => updateOpen(!open);
  const toggleInspect = useCallback(() => {
    updateInspect($apply(s => {
      onInspect && onInspect(!s);
      return !s;
    }));
  }, [onInspect, updateInspect]);

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

  const state = useMemo(() => ({
    expandedCursor,
    optionsCursor,
    hoveredState: hoveredCursor()[0],
    focusedState: focusedCursor()[0],
    selectedState: selectedCursor()[0],
    highlightState,
  }), [expandedCursor, optionsCursor, selectedCursor, hoveredCursor, focusedCursor, highlightState]);

  const api: InspectAPI = useMemo(() => {

    const forceUpdate = () => {
      setVersion(incrementVersion);
    };

    const selectFiber = (fiber: LiveFiber<any> | null = null) => {
      updateSelected({ $set: fiber });

      if (fiber) {
        const tag = getFiberTags(fiber);
        if (tag & FiberTag.Data) updatePreferredTab('data');
        if (tag & FiberTag.View) updatePreferredTab('view');
        if (tag & FiberTag.Layout) updatePreferredTab('layout');
        if (tag & FiberTag.Texture) updatePreferredTab('textures');
        if (tag & FiberTag.Compute) updatePreferredTab('compute');
        if (tag & FiberTag.Raster) updatePreferredTab('fragment');
      }
      if (!fiber) {
        updateTab(null);
      }
    }

    const focusFiber = (fiber: LiveFiber<any> | null = null) => {
      const id = fiber?.id;
      updateFocused(id != null && id !== rootId ? id : null);
    };

    const hoverFiber = (
      fiber: LiveFiber<any> | null = null,
      renderDepth: number = 0,
      sticky?: boolean,
    ) =>
      updateHovered(
        $apply(prev => {
          if (sticky && prev.fiber) return prev;
          return {
            fiber,
            depth: renderDepth,
          };
        })
      );

    const makeHandlers = (fiber: LiveFiber<any>, renderDepth: number = 0) => {
      const select = (e?: MouseEvent) => { selectFiber(fiber); e?.stopPropagation(); };
      const hover = (e: MouseEvent) => hoverFiber(fiber, renderDepth, e.altKey);
      const unhover = (e: MouseEvent) => hoverFiber(null, 0, e.altKey);
      const focus = () => focusFiber(fiber);

      return {select, hover, unhover, focus};
    }

    return {forceUpdate, selectFiber, focusFiber, hoverFiber, makeHandlers};
  }, [rootId, updateSelected, updateFocused, updateHovered, updateTab, updatePreferredTab, setVersion]);

  const sidebar = (
    <InsetColumnFull>
      {(toolbar ?? true)  ? (
        <ToolbarRow>
          <ToolbarOptions cursor={optionsCursor} toggleInspect={onInspect && toggleInspect} />
        </ToolbarRow>
      ) : null}
      <ToolbarFilter state={state} api={api} />
      <ToolbarNav state={state} api={api} />
      <SidebarPanel key={focusedId} onClick={() => api.selectFiber(null)} onDoubleClick={() => updateFocused(null)}>
        <FiberTree
          state={state}
          api={api}
          fiber={fiber}
          fibers={fibers}
          legend={legend}
          skipDepth={skip}
        />
      </SidebarPanel>
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
      <PingProvider fiber={fiber} fibers={fibers} api={api}>
        <HostHighlight fiber={fiber} fibers={fibers} findFiber={findFiber} toggleInspect={toggleInspect} api={api} />
        <InspectContainer onMouseDown={onMouseDown} className="ui inverted">
          <div style={fullSize
              ? {display: 'flex', flexDirection: 'column', width: '100%', minHeight: 0, height: '100%', maxHeight: '100%', flexGrow: 1}
              : {display: 'flex', height: '100%'}}>
            <RowPanel style={fullSize
                ? {position: 'relative', flexGrow: 1, minHeight: 0}
                : {position: 'relative', width: splitLeft + '%', borderRight: '1px solid var(--LiveInspect-borderThin'}}>
              <PanelAbsolute>
                {sidebar}
              </PanelAbsolute>
              {resize && !fullSize ? <Resizer side="right" value={splitLeft} onChange={setSplitLeft} /> : null}
            </RowPanel>
            {selectedFiber ? (
              <RowPanel style={fullSize
                  ? {position: 'relative', height: splitBottom + '%', zIndex: 10, flexShrink: 0, background: '#000', borderTop: '1px solid var(--LiveInspect-borderThin' }
                  : {width: (100 - splitLeft) + '%'}
                }>
                <PanelScrollable>
                  <Panels fiber={selectedFiber} api={api} fullSize={fullSize} tab={tab} preferredTab={preferredTab} onTab={updateTab} />
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
  fibers: Map<number, LiveFiber<any>>,
  findFiber?: number,
  toggleInspect: () => void,
  api: InspectAPI,
};

const HostHighlight = (props: HostHighlightProps) => {
  const {api, fiber, fibers, findFiber, toggleInspect} = props;

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

        api.hoverFiber(fiber);
      }
      else {
        api.hoverFiber(null);
      }
    };

    return () => { host.__highlight = () => {}; }
  }, [host, fibers, api, toggleInspect]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const find = fibers.get(findFiber!);
    if (find) api.selectFiber(find);
  }, [fibers, findFiber, api]);

  return null;
};
