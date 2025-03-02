import React, { useCallback } from 'react';
import type { Cursor } from '@use-gpu/state';
import type { ExpandState } from './types';

type ExpandableProps = {
  id: string | number,
  initialValue: boolean,
  expandedCursor: Cursor<ExpandState>,
  children: (expand: boolean, onClick: (e: any) => void) => React.ReactElement,
}

export const Expandable: React.FC<ExpandableProps> = ({id, initialValue, expandedCursor, children}) => {
  const [expand = initialValue, updateExpand] = expandedCursor[id]();

  const onClick = useCallback((e: any) => {
    updateExpand(expand === false);
    e.preventDefault();
    e.stopPropagation();
  }, [expand, updateExpand]);

  return children(expand, onClick);
}
