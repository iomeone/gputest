import type { LiveFiber } from '@use-gpu/live';
import type { ExpandState, SelectState, HoverState, PingState } from './types';

import { formatNode, formatValue, YEET } from '@use-gpu/live';
import { useUpdateState } from '@use-gpu/state';

import React, { memo, useLayoutEffect, useEffect, useMemo, useState } from 'react';
import { Node } from './node';
import { FiberTree } from './fiber';
import { Props } from './panels/props';
import { Call } from './panels/call';
import { Geometry } from './panels/geometry';
import { Shader } from './panels/shader';
import { Layout } from './panels/layout';
import {
  InspectContainer, InspectToggle, Button, SmallButton, TreeControls, Spacer,
  SplitRow, RowPanel, Panel, PanelFull, PanelScrollable, Inset, InsetColumnFull,
} from './layout';
import { PingProvider } from './ping';
import { DetailSlider } from './detail';
import { IconItem, SVGInspect, SVGPickElement, SVGClose } from './svg';

import * as Tabs from '@radix-ui/react-tabs';

type InspectFiber = Record<string, any>;
type InspectMap = WeakMap<LiveFiber<any>, InspectFiber>;

type InspectProps = {
  fiber: LiveFiber<any>,
  onInspect?: (b: boolean) => void,
}

export const Inspect: React.FC<InspectProps> = ({fiber, onInspect}) => {
  const expandCursor = useUpdateState<ExpandState>({});
  const selectedCursor = useUpdateState<SelectState>(null);
  const depthCursor = useUpdateState<number>(10);
  const hoveredCursor = useUpdateState<HoverState>(() => ({
    fiber: null, by: null, deps: [], precs: [], root: null, depth: 0,
  }));
  
  const [inspect, setInspect] = useState<boolean>(false);
  const toggleInspect = () => {
    setInspect(s => {
      onInspect && onInspect(!s);
      return !s;
    });
  };

  const [open, updateOpen] = useUpdateState<boolean>(false);
  const toggleOpen = () => updateOpen(!open);

  const fibers = new Map<number, LiveFiber<any>>();
  const [selectedFiber, setSelected] = selectedCursor;
  const [depthLimit, setDepthLimit] = depthCursor;
  const [{fiber: hoveredFiber}, updateHovered] = hoveredCursor;

  useLayoutEffect(() => {
    const el = document.querySelector('#use-gpu .canvas');
    if (!el || !open) return;
    
    (el as any).style.left = '34%';
    return () => {
      (el as any).style.left = '0';
    };
  }, [open]);

  useLayoutEffect(() => {
    const setHovered = hoveredFiber?.__inspect?.setHovered;
    if (!setHovered) return;
    
    setHovered(true);
    return () => setHovered(false);
  }, [hoveredFiber])
  
  const {host} = fiber;
  useLayoutEffect(() => {
    if (!host) return;

    host.__highlight = (id: number | null, active?: boolean) => {
      const fiber = fibers.get(id ?? 0);
      if (fiber) {
        if (active) {
          toggleInspect();
          return setSelected({ $set: fiber });
        }

        const root = fiber.yeeted && fiber.type === YEET ? fiber.yeeted.root : null;
        updateHovered({ $set: {
          fiber,
          by: fibers.get(fiber.by) ?? null,
          deps: host ? Array.from(host.traceDown(fiber)) : [],
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
  }, [host, fibers]);

  let computeTab: React.ReactNode;
  let vertexTab: React.ReactNode;
  let fragmentTab: React.ReactNode;
  let layoutTab: React.ReactNode;
  let geometryTab: React.ReactNode;
  if (selectedFiber) {
    const inspect = selectedFiber.__inspect;
    if (inspect) {
      const {compute, vertex, fragment, layout, render} = inspect;
      if (compute) {
        computeTab = <Shader type="compute" fiber={selectedFiber} />;
      }
      if (vertex) {
        vertexTab = <Shader type="vertex" fiber={selectedFiber} />;
      }
      if (fragment) {
        fragmentTab = <Shader type="fragment" fiber={selectedFiber} />;
      }
      if (layout) {
        layoutTab = <Layout fiber={selectedFiber} />;
      }
      if (render) {
        geometryTab = <Geometry fiber={selectedFiber} />;
      }
    }
  }

  const tree = (
    <InsetColumnFull>
      <TreeControls>
        <DetailSlider value={depthLimit} onChange={setDepthLimit} />
        <Spacer />
        <SmallButton className={inspect ? 'active' : ''} onClick={toggleInspect}>
          <IconItem height={24} top={1}><SVGPickElement size={24} /></IconItem>
        </SmallButton>
      </TreeControls>
      <FiberTree
        fiber={fiber}
        fibers={fibers}
        depthLimit={depthLimit}
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
          {computeTab ? <Tabs.Trigger value="compute">Compute</Tabs.Trigger> : null}
          {vertexTab ? <Tabs.Trigger value="vertex">Vertex</Tabs.Trigger> : null}
          {fragmentTab ? <Tabs.Trigger value="fragment">Fragment</Tabs.Trigger> : null}
          {layoutTab ? <Tabs.Trigger value="layout">Layout</Tabs.Trigger> : null}
          {geometryTab ? <Tabs.Trigger value="geometry">Geometry</Tabs.Trigger> : null}
        </Tabs.List>
        <Tabs.Content value="props">{selectedFiber ? <Props fiber={selectedFiber} fibers={fibers} /> : null}</Tabs.Content>
        <Tabs.Content value="fiber">{selectedFiber ? <Call fiber={selectedFiber} fibers={fibers} /> : null}</Tabs.Content>
        {computeTab ? <Tabs.Content value="compute">{computeTab}</Tabs.Content> : null }
        {vertexTab ? <Tabs.Content value="vertex">{vertexTab}</Tabs.Content> : null }
        {fragmentTab ? <Tabs.Content value="fragment">{fragmentTab}</Tabs.Content> : null }
        {layoutTab ? <Tabs.Content value="layout">{layoutTab}</Tabs.Content> : null }
        {geometryTab ? <Tabs.Content value="geometry">{geometryTab}</Tabs.Content> : null }
      </Tabs.Root>
    </Inset>
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
        <InspectContainer onMouseDown={onMouseDown} className="ui inverted">
          <SplitRow>
            <RowPanel style={{width: '34%'}}>
              <PanelFull onClick={() => setSelected(null)} className="tree-scroller">
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
      </PingProvider>
    ) : null}
    <InspectToggle onClick={toggleOpen}>
      <Button>{open ? <SVGClose /> : <div style={{margin: -4}}><SVGInspect size={24} /></div>}</Button>
    </InspectToggle>
  </div>);
}
