import React, { useCallback } from 'react';
import type { Cursor } from '@use-gpu/state';
import type { ExpandState } from './types';

import { useRefineCursor, useUpdateState } from '@use-gpu/state';


type ExpandableProps = {
  id: string | number,
  initialValue: boolean,
  expandCursor: Cursor<ExpandState>,
  children: (expand: boolean, onClick: (e: any) => void) => React.ReactElement,
}

export const Expandable: React.FC<ExpandableProps> = ({id, initialValue, expandCursor, children}) => {
  let [expand, updateExpand] = useRefineCursor<boolean>(expandCursor)(id);

  if (expand === undefined) expand = initialValue;

  const onClick = useCallback((e: any) => {
    updateExpand(expand === false);
    e.preventDefault();
    e.stopPropagation();
  }, [expand, updateExpand]);

  return children(expand, onClick);
}
