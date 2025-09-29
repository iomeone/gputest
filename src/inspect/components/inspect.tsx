import type { LiveFiber } from '@use-gpu/live';
import type { ExpandState, SelectState, HoverState, OptionState, PingState, InspectAppearance } from './types';

import { formatNode, formatValue, YEET } from '@use-gpu/live';
import { useUpdateState, useRefineCursor, $apply } from '@use-gpu/state';

import React, { memo, useCallback, useLayoutEffect, useEffect, useMemo, useState, SetStateAction } from 'react';

import { makeUseLocalState } from '../hooks/useLocalState';
import { PingProvider, usePingContext } from '../providers/ping-provider';
import { useAppearance } from '../providers/appearance-provider';

import { Node } from './node';
import { FiberTree } from './fiber';
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

  const expandCursor = useUpdateState<ExpandState>({});
  const selectedCursor = useUpdateState<SelectState>(null);
  const optionCursor = useUpdateState<OptionState>(
    {
      ...INITIAL_STATE,
      ...initialState,
    },
    save ? makeUseLocalState(
      getOptionsKey('state', sub),
      (obj: any) => ({...INITIAL_STATE, ...obj}),
    ) : useState
  );
  const hoveredCursor = useUpdateState<HoverState>(() => ({
    fiber: null, by: null, deps: [], precs: [], root: null, depth: 0,
  }));

  const useOption = useRefineCursor(optionCursor);

  let [selectedFiber, updateSelected] = selectedCursor;
  const [depthLimit] = useOption<number>('depth');
  const [runCounts] = useOption<boolean>('counts');
  const [fullSize] = useOption<boolean>('fullSize');
  const [builtins] = useOption<boolean>('builtins');
  const [highlight] = useOption<boolean>('highlight');
  const [tab, updateTab] = useOption<string>('tab');
  const [splitLeft, setSplitLeft] = useOption<number>('splitLeft');
  const [splitBottom, setSplitBottom] = useOption<number>('splitBottom');
  const [inspect, updateInspect] = useOption<boolean>('inspect');
  const [{fiber: hoveredFiber}, updateHovered] = hoveredCursor;

  if (!select) selectedCursor[1] = updateSelected = NOP;

  const setSelected = useCallback((fiber?: LiveFiber<any> | null) => {
    updateSelected({ $set: fiber ?? null });
  }, [updateSelected, select]);

  const [open, updateOpen] = useOption<boolean>('open');
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
  
  const tree = (
    <InsetColumnFull>
      {(toolbar ?? true)  ? (
        <TreeControls>
          <Options cursor={optionCursor} toggleInspect={onInspect && toggleInspect} />
        </TreeControls>
      ) : null}
      <TreeView onClick={() => updateSelected(null)}>
        <FiberTree
          fiber={fiber}
          legend={legend}
          skipDepth={skip}
          depthLimit={depthLimit}
          runCounts={runCounts}
          builtins={builtins}
          highlight={highlight}
          expandCursor={expandCursor}
          selectedCursor={selectedCursor}
          hoveredCursor={hoveredCursor}
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
        <HostHighlight fiber={fiber} findFiber={findFiber} setSelected={setSelected} toggleInspect={toggleInspect} updateHovered={updateHovered} />
        <InspectContainer onMouseDown={onMouseDown} className="ui inverted">
          <div style={fullSize
              ? {display: 'flex', flexDirection: 'column', width: '100%', minHeight: 0, height: '100%', maxHeight: '100%', flexGrow: 1}
              : {display: 'flex', height: '100%'}}>
            <RowPanel style={fullSize
                ? {position: 'relative', flexGrow: 1, minHeight: 0}
                : {position: 'relative', width: splitLeft + '%'}}>
              <PanelAbsolute>
                {tree}
              </PanelAbsolute>
              {resize ? <Resizer side="right" value={splitLeft} onChange={setSplitLeft} /> : null}
            </RowPanel>
            {selectedFiber ? (
              <RowPanel style={fullSize
                  ? {position: 'relative', height: splitBottom + '%', zIndex: 10, flexShrink: 0, background: '#000', borderTop: '1px solid var(--LiveInspect-borderThin' }
                  : {width: (100 - splitLeft) + '%'}
                }>
                <PanelScrollable>
                  <Panels fiber={selectedFiber} selectFiber={setSelected} fullSize={fullSize} tab={tab} onTab={updateTab} />
                </PanelScrollable>
                {resize ? <Resizer side="top" value={splitBottom} onChange={setSplitBottom} /> : null}
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
  setSelected: (fiber?: LiveFiber<any> | null) => void,
  updateHovered: (hovered: any) => void,
};

const HostHighlight = (props: HostHighlightProps) => {
  const {fiber, findFiber, setSelected, toggleInspect, updateHovered} = props;
  const {fibers} = usePingContext();

  const {host} = fiber;
  useLayoutEffect(() => {
    if (!host) return;

    host.__highlight = (id: number | null, active?: boolean) => {
      const fiber = fibers.get(id ?? 0);
      if (fiber) {
        if (active) {
          toggleInspect();
          return setSelected(fiber);
        }

        const root = fiber.yeeted && fiber.type === YEET ? fiber.yeeted.root : null;
        updateHovered({ $set: {
          fiber,
          by: fibers.get(fiber.by) ?? null,
          deps: host ? Array.from(host.traceDown(fiber)).map(f => f.id) : [],
          precs: host ? Array.from(host.traceUp(fiber)) : [],
          root,
          depth: 0,
        } });
      }
      else {
        updateHovered({ $set: {
          fiber: null,
          by: null,
          deps: [],
          precs: [],
          root: null,
          depth: 0,
        } });
      }
    };

    return () => { host.__highlight = () => {}; }
  }, [host, fibers, setSelected]);

  useEffect(() => {
    const find = fibers.get(findFiber!);
    if (find) setSelected(find);
  }, [findFiber]);

  return null;
};
