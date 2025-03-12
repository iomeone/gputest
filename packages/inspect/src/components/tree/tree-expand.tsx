import React, { FC } from 'react';
import { IconItem, SVGChevronDown, SVGChevronRight } from '../svg';

import { TreeRow, TreeToggle } from './tree-layout';

export type TreeExpandProps = PropsWithChildren<{
  expand: boolean,
  onToggle: (e: any) => void,
  openIcon?: any,
  closedIcon?: any,
}>;

export const TreeExpand: FC<TreeExpandProps> = ({
  expand,
  onToggle,
  children,
  openIcon = <SVGChevronDown />,
  closedIcon = <SVGChevronRight />,
}) => {
  const icon = <IconItem>{expand !== false ? openIcon : closedIcon}</IconItem>;

  return (<>
    <TreeRow>
      <TreeToggle onClick={onToggle}>{icon}</TreeToggle>
      {children}
    </TreeRow>
  </>);
}