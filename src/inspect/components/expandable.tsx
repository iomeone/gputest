import React from 'react';
import { useRefineCursor, Cursor } from './cursor';
import { ExpandState } from './types';

type ExpandableProps = {
  id: string | number,
  expandCursor: Cursor<ExpandState>,
  children: (expand: boolean, onClick: (e: any) => void) => React.ReactElement,
}

export const Expandable: React.FC<ExpandableProps> = ({id, expandCursor, children}) => {
  const [expand, updateExpand] = useRefineCursor<boolean>(expandCursor)(id);

  const onClick = (e: any) => {
    updateExpand(expand === false);
    e.preventDefault();
    e.stopPropagation();
  }

  return children(expand, onClick);
}
