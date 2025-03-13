import type { InspectState, InspectAPI } from '../types';

import React, { FC } from 'react';
import { useAddIns } from '../../providers/add-in-provider';
import { ToolbarLabel, ToolbarPaddedRow } from '../panels/panels-layout';
import { SmallButton } from '../layout';

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
  
  return (
    <ToolbarPaddedRow>
      <ToolbarLabel>Filter</ToolbarLabel>
      {options.map((filter) => {
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
    </ToolbarPaddedRow>
  );
};
