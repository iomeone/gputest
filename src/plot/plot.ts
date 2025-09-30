import type { LiveComponent, PropsWithChildren } from '../live';
import { use } from '../live';
import { VirtualLayers } from '../workbench';

export type PlotProps = PropsWithChildren<object>;

const OPTIONS = {};

export const Plot: LiveComponent<PlotProps> = (props) => {
  const {children} = props;
  return children ? use(VirtualLayers, { ...OPTIONS, children }) : null;
};


