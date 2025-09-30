import React, { useCallback } from 'react';
import type { Cursor } from '@use-gpu/state';
import type { ExpandState } from './types';

import { useCursor, useUpdateState } from '@use-gpu/state/react';


type ExpandableProps = {
  id: string | number,
  initialValue: boolean,
  expandedCursor: Cursor<ExpandState>,
  children: (expand: boolean, onClick: (e: any) => void) => React.ReactElement,
}

export const Expandable: React.FC<ExpandableProps> = ({id, initialValue, expandedCursor, children}) => {
  let [expand, updateExpand] = expandedCursor[id]();

  if (expand === undefined) expand = initialValue;

  const onClick = useCallback((e: any) => {
    updateExpand(expand === false);
    e.preventDefault();
    e.stopPropagation();
  }, [expand, updateExpand]);

  return children(expand, onClick);
}
