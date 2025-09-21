import { LiveComponent, LiveElement } from '../live/types';

import { memo, provide, makeContext, useMemo } from '../live';
import { ViewUniforms, UniformAttribute } from '../core/types';

export const ViewContext = makeContext(null, 'ViewContext');

export type ViewProviderProps = {
  defs: UniformAttribute[],
  uniforms: ViewUniforms,
  children: LiveElement<any>,
};

export const ViewProvider: LiveComponent<ViewProviderProps> = memo((fiber) => (props) => {
  const {defs, uniforms, children} = props;
  const context = useMemo(() => ({defs, uniforms}), [defs, uniforms]);
  return provide(ViewContext, context, children);
}, 'ViewProvider');