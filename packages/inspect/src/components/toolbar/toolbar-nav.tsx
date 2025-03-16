import type { InspectState, InspectAPI } from '../types';

import React, { FC } from 'react';

import { InlineButton } from '../layout';
import { IconItem, SVGChevronLeft } from '../svg';
import { ToolbarPaddedRow } from '../panels/panels-layout';

export type ToolbarNavProps = {
  state: InspectState,
  api: InspectAPI,
};

export const ToolbarNav: FC<ToolbarNavProps> = (props: ToolbarNavProps) => {
  const {api: {focusFiber}, state: {focusedState}} = props;
  const back = focusedState ? (
    <ToolbarPaddedRow>
      <InlineButton className="icon-left" onClick={() => focusFiber(null)}>
        <IconItem top={0}><SVGChevronLeft /></IconItem> Back to root
      </InlineButton>
    </ToolbarPaddedRow>
  ) : null;
  return back;
};
