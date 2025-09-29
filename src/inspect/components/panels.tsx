import type { LiveFiber } from '@use-gpu/live';
import type { Update } from '@use-gpu/state';
import type { InspectAddIns } from './types';
import React, { FC, useState } from 'react';
import { styled as _styled } from '@stitches/react';

import { Inset, InsetLeftRightBottom } from './layout';
import { useAddIns } from '../providers/add-in-provider';
import { useAppearance } from '../providers/appearance-provider';
import { usePingTracker, usePingContext } from '../providers/ping-provider';

const styled: any = _styled;

export type PanelsProps = {
  fiber: LiveFiber<any>,
  selectFiber: (fiber?: LiveFiber<any> | null) => void,
  fullSize?: boolean,
  tab: string,
  onTab: (s: Update<string>) => void,
};

export const StyledTabList = styled('div', {
  height: '40px',
  borderBottom: '2px solid var(--LiveInspect-backgroundInactive)',
  marginBottom: '10px',
});

export const StyledTab = styled('button', {
  background: 'none',
  font: 'inherit',
  color: 'inherit',
  border: '0',
  padding: '0px 20px',
  lineHeight: '40px',
  height: '40px',
  marginBottom: '-2px',
  borderBottom: '2px solid transparent',
  '&:hover': {
    borderBottom: '3px solid var(--LiveInspect-backgroundHover)',
  },
  '&.active': {
    fontWeight: 'bold',
    color: 'var(--LiveInspect-colorTextActive)',
    borderBottom: '3px solid var(--LiveInspect-backgroundActive)',
  },
});

export const Panels: FC<PanelsProps> = (props: PanelsProps) => {
  const {fiber, selectFiber, fullSize, tab, onTab } = props;
  
  const addIns = useAddIns();
  const {fibers} = usePingContext();
  
  const {props: panels} = addIns;
  const [first] = panels;
  if (!first) return null;

  usePingTracker();
  const {tabs} = useAppearance();
  
  const active = panels.filter((panel) => panel.enabled(fiber, fibers));
  const currentTab = active.find((panel) => panel.id === tab) ?? active[0];
  if (!currentTab) return null;

  const handleSelectFiber = (fiber: number | LiveFiber<any>) => {
    const f = typeof fiber === 'number' ? fibers.get(fiber) : fiber;
    selectFiber(f);
  };

  const Wrap = fullSize ? InsetLeftRightBottom : Inset;

  return (
    <Wrap>
      { tabs !== false ? (
        <StyledTabList>
          {active.map((panel) => (
            <StyledTab key={panel.id} onClick={() => onTab(panel.id)} className={currentTab === panel ? 'active' : null}>
              {panel.label}
            </StyledTab>
          ))}
        </StyledTabList>
      ) : null}
      {fiber ? currentTab!.render(fiber, fibers, handleSelectFiber) : null}
    </Wrap>
  );
};
