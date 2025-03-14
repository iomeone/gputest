import type { InspectState, InspectAPI } from '../types';

import React, { FC } from 'react';
import { useAddIns } from '../../providers/add-in-provider';
import { ToolbarLabel, ToolbarPaddedRow } from '../panels/panels-layout';
import { Row, SmallButton } from '../layout';

export type ToolbarFilterProps = {
  state: InspectState,
  api: InspectAPI,
};

export const ToolbarFilter: FC<ToolbarFilterProps> = (props: ToolbarFilterProps) => {
  const {state, api} = props;
  const {filters: options} = useAddIns();

  const {optionsCursor} = state;
  const [filters, updateFilters] = optionsCursor.filterTags();

  const toggleFilter = (key: string) => {
    updateFilters(filters ^ key);
  };

  const groups: any[] = [];
  for (const o of options) {
    let g = groups.find(g => g[0].group === o.group);
    if (!g) groups.push(g = []);
    if (g) g.push(o);
  }
  
  return (
    <ToolbarPaddedRow>
      <ToolbarLabel>Filter</ToolbarLabel>
      <Row style={{ gap: 8 }}>
        {groups.map((group, i) => (
          <Row key={i.toString()}>
            {group.map((filter) => {
              const {key, label, icon} = filter;

              const active = filters & filter.key;
              const className = active ? 'active' : '';

              return (
                <SmallButton
                  key={key}
                  title={label}
                  className={className}
                  onClick={() => toggleFilter(key)}
                >
                  {icon}
                </SmallButton>
              );
            })}
          </Row>
        ))}
      </Row>
    </ToolbarPaddedRow>
  );
};
