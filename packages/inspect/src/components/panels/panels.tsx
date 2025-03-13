import type { LiveFiber } from '@use-gpu/live';
import type { Update } from '@use-gpu/state';
import type { InspectAPI } from '../types';

import React, { FC } from 'react';

import { Inset, InsetLeftRightBottom } from '../layout';
import { useAddIns } from '../../providers/add-in-provider';
import { useAppearance } from '../../providers/appearance-provider';
import { usePingTracker, usePingContext } from '../../providers/ping-provider';

import { IconItem } from '../svg';
import { StyledTabList, StyledTab } from './panels-layout';

export type PanelsProps = {
  fiber: LiveFiber<any>,
  api: InspectAPI,
  fullSize?: boolean,
  tab: string,
  preferredTab: string,
  onTab: (s: Update<string>) => void,
};

export const Panels: FC<PanelsProps> = (props: PanelsProps) => {
  const {fiber, api, fullSize, tab, preferredTab, onTab } = props;

  const {fibers} = usePingContext();
  const {props: panels} = useAddIns();

  const [first] = panels;
  if (!first) return null;

  usePingTracker();
  const {tabs} = useAppearance();

  const active = panels.filter((panel) => panel.enabled(fiber, fibers));
  const currentTab = (
    active.find((panel) => panel.key === tab) ??
    active.find((panel) => panel.key === preferredTab) ??
    active[0]
  );
  if (!currentTab) return null;

  const Wrap = fullSize ? InsetLeftRightBottom : Inset;

  return (
    <Wrap style={{position: 'relative'}}>
      { tabs !== false ? (
        <StyledTabList>
          {active.map((panel) => (
            <StyledTab key={panel.key} onClick={() => onTab(panel.key)} className={currentTab === panel ? 'active' : null}>
              {panel.label}{panel.icon ? <>&nbsp;&nbsp;<IconItem>{panel.icon}</IconItem></> : null}
            </StyledTab>
          ))}
        </StyledTabList>
      ) : null}
      {fiber ? currentTab.render(fiber, fibers, api) : null}
    </Wrap>
  );
};
