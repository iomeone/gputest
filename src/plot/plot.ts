import type { LiveComponent, PropsWithChildren } from '../live';

export type PlotProps = PropsWithChildren<object>;

export const Plot: LiveComponent<PlotProps> = (props) => {
  return props.children ?? null;
};


