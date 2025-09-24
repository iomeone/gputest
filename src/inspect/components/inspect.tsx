import { LiveFiber } from '@use-gpu/live/types';
import { formatNode, formatValue, renderFibers } from '@use-gpu/live';
import { useUpdateState } from './cursor';
import { ExpandState, SelectState, HoverState, PingState } from './types';

import React, { memo, useLayoutEffect, useEffect, useMemo, useState } from 'react';
import { Node } from './node';
import { FiberTree } from './fiber';
import { Props } from './props';
import { Call } from './call';
import { Shader } from './shader';
import {
  InspectContainer, InspectToggle, Button,
  SplitRow, RowPanel, Panel, PanelFull, PanelScrollable, Inset, InsetColumnFull,
} from './layout';

import * as Tabs from '@radix-ui/react-tabs';
import "../theme.css";

const ICON = (s: string) => <span className="m-icon">{s}</span>

type InspectFiber = Record<string, any>;
type InspectMap = WeakMap<LiveFiber<any>, InspectFiber>;

type InspectProps = {
  fiber: LiveFiber<any>,
}

export const Inspect: React.FC<InspectProps> = ({fiber}) => {
  const expandCursor = useUpdateState<ExpandState>({});
  const selectedCursor = useUpdateState<SelectState>(null);
  const hoveredCursor = useUpdateState<HoverState>(() => ({ fiber: null, deps: [], root: null }));

  const [open, updateOpen] = useUpdateState<boolean>(false);
  const toggleOpen = () => updateOpen(!open);

  const fibers = new Map<number, LiveFiber<any>>();
  const [selectedFiber, setSelected] = selectedCursor;
  const ping = usePingTracker(fiber);

  const panes = selectedFiber ? [
    {
      menuItem: 'Props',
      render: () => <Props fiber={selectedFiber} fibers={fibers} />
    },
    {
      menuItem: 'Fiber',
      render: () => <Call fiber={selectedFiber} fibers={fibers} />
    },
  ] : [];

  let vertexTab: React.ReactNode;
  let fragmentTab: React.ReactNode;
  if (selectedFiber) {
    const inspect = selectedFiber.__inspect;
    if (inspect) {
      const {vertex, fragment} = inspect;
      if (vertex) {
        vertexTab = <Shader shader={vertex} />;
      }
      if (fragment) {
        fragmentTab = <Shader shader={fragment} />
      }
    }
  }

  const tree = (
    <InsetColumnFull>
      <FiberTree
        fiber={fiber}
        fibers={fibers}
        ping={ping}
        expandCursor={expandCursor}
        selectedCursor={selectedCursor}
        hoveredCursor={hoveredCursor}
      />
    </InsetColumnFull>
  );

  const props = (
    <Inset>
      <Tabs.Root defaultValue="props">
        <Tabs.List>
          <Tabs.Trigger value="props">Props</Tabs.Trigger>
          <Tabs.Trigger value="fiber">Fiber</Tabs.Trigger>
          {vertexTab ? <Tabs.Trigger value="vertex">Vertex</Tabs.Trigger> : null}
          {fragmentTab ? <Tabs.Trigger value="fragment">Fragment</Tabs.Trigger> : null}
        </Tabs.List>
        <Tabs.Content value="props"><Props fiber={selectedFiber} fibers={fibers} /></Tabs.Content>
        <Tabs.Content value="fiber"><Call fiber={selectedFiber} fibers={fibers} /></Tabs.Content>
        {vertexTab ? <Tabs.Content value="vertex">{vertexTab}</Tabs.Content> : null }
        {fragmentTab ? <Tabs.Content value="fragment">{fragmentTab}</Tabs.Content> : null }
      </Tabs.Root>
    </Inset>
  );

  // Avoid text selection on double click
  const onMouseDown = (e: any) => {
    if (e.detail > 1) {
      e.preventDefault();
    }
  };

  return (<>
    {open ? (
      <InspectContainer onMouseDown={onMouseDown} className="ui inverted">
        <SplitRow>
          <RowPanel style={{width: '34%'}}>
            <PanelFull onClick={() => setSelected(null)}>
              {tree}
            </PanelFull>
          </RowPanel>
          {selectedFiber ? (
            <RowPanel style={{width: '66%'}}>
              <PanelScrollable>
                {props}
              </PanelScrollable>
            </RowPanel>
          ) : null}
        </SplitRow>
      </InspectContainer>
    ) : null}
    <InspectToggle onClick={toggleOpen}>
      <Button>{open ? ICON("close") : ICON("bug_report")}</Button>
    </InspectToggle>
  </>);
}

// Track update pings to show highlights in tree
type Timer = ReturnType<typeof setTimeout>;
const usePingTracker = (fiber: LiveFiber<any>) => {
  const [ping, setPing] = useState<PingState>({});

  const [ref] = useState({ ping });
  ref.ping = ping;

  useEffect(() => {
    let uTimer: Timer | null = null;
    let rTimer: Timer | null = null;

    let update: Record<string, number> = {};
    let reset: Record<string, number> = {};

    const flush = () => {
      const u = update;
      uTimer = null;
      update = {};
      setPing((s) => ({...s, ...u}));

      for (let k in u) reset[k] = 0;
      if (!rTimer) rTimer = setTimeout(() => {
        const r = reset;
        rTimer = null;
        reset = {};
        setPing((s) => ({...s, ...r}))
      }, 500);
    }

    if (!fiber.host) return;
    
    fiber.host.__ping = (fiber: LiveFiber<any>) => {
      reset[fiber.id] = update[fiber.id] = ((ref.ping[fiber.id] || 0) % 256) + 1;      
      if (!uTimer) uTimer = setTimeout(flush, 0);
    };
    return () => {
      if (fiber.host) fiber.host.__ping = () => {};
    };
  }, [ref]);

  return ping;
}
