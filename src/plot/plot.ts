import type { LiveComponent, PropsWithChildren } from '@use-gpu/live';
import { use, wrap } from '@use-gpu/live';
import { SDFFontProvider, VirtualLayers } from '@use-gpu/workbench';

export type PlotProps = PropsWithChildren<object>;

const OPTIONS = {};

export const Plot: LiveComponent<PlotProps> = (props) => {
  const {children} = props;
  return children ? wrap(SDFFontProvider, use(VirtualLayers, { ...OPTIONS, children })) : null;
};


