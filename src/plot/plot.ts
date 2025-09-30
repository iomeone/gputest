import type { LiveComponent, PropsWithChildren } from '../live';
import { use, wrap } from '../live';
import { SDFFontProvider, VirtualLayers } from '../workbench';

export type PlotProps = PropsWithChildren<object>;

const OPTIONS = {};

export const Plot: LiveComponent<PlotProps> = (props) => {
  const {children} = props;
  return children ? wrap(SDFFontProvider, use(VirtualLayers, { ...OPTIONS, children })) : null;
};


