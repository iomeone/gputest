import { LiveComponent, LiveElement } from '../../live/types';
// import { use, provide, useContext, useOne, useMemo } from '../../live';

export type PlotProps = {
  children?: LiveElement<any>,
};

export const Plot: LiveComponent<PlotProps> = (props) => {
  return props.children;
};


