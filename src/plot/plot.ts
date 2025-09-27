import type { LiveComponent, LiveElement } from '../live';

export type PlotProps = {
  children?: LiveElement<any>,
};

export const Plot: LiveComponent<PlotProps> = (props) => {
  return props.children ?? null;
};


