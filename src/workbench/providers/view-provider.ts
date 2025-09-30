import type { LiveComponent, PropsWithChildren, Ref } from '../../live';
import type { XYZ, ViewCuller, ViewUniforms } from '../../core';
import type { ShaderModule } from '../../shader';
import type { PointerEvent } from '../interact/event';
import type { PassBinding } from '../pass/types';

import { provide, makeContext, useContext, useNoContext, useMemo, useOne, useNoOne } from '../../live';
import { makeViewUniforms } from '../../core';

import { useUniformBinding } from '../hooks/useUniformSource';
import { useFrustumCuller } from '../hooks/useFrustumCuller';
import { useFrustumPicker } from '../hooks/useFrustumPicker';
import { QueueReconciler } from '../reconcilers/index';

import viewBindingWGSL, { ViewUniforms as ViewUniformsWGSL } from '../../wgsl/use/viewwgsl';
import { useInspectable } from '../hooks/useInspectable'

const {signal} = QueueReconciler;

const DEFAULT_VIEW_CONTEXT = {
  uniforms: makeViewUniforms(),
  binding: {module: viewBindingWGSL},
  pick: () => [[0, 0, 0], [0, 0, -1]] as [XYZ, XYZ],
  cull: () => true,
} as ViewContextProps;

export const ViewContext = makeContext<ViewContextProps>(DEFAULT_VIEW_CONTEXT, 'ViewContext');

export type ViewContextProps = {
  uniforms: ViewUniforms,
  binding: PassBinding,
  cull: ViewCuller,
  pick: (event: PointerEvent) => [XYZ, XYZ],
};

export type ViewProviderProps = PropsWithChildren<{
  uniforms?: Record<string, Ref<any>>,
  module?: ShaderModule,
  type?: ShaderModule,
}>;

export const ViewProvider: LiveComponent<ViewProviderProps> = (props: ViewProviderProps) => {
  const {
    uniforms: maybeUniforms,
    module,
    type,

    children,
  } = props;

  const inspect = useInspectable();

  const {pick, cull, uniforms} = useViewUniforms(maybeUniforms);
  const {binding, upload} = useViewBinding(uniforms, module, type);
  upload();

  const context = useMemo(() => ({
    binding,
    cull,
    pick,
    uniforms,
  }), [binding, cull, pick, uniforms]);

  inspect({
    view: uniforms,
  });

  return [
    signal(),
    provide(ViewContext, context, children),
  ];
};

export const useViewContext = () => useContext(ViewContext);
export const useNoViewContext = () => useNoContext(ViewContext);

export const useViewBinding = (
  uniforms: Record<string, Ref<any>>,
  module: ShaderModule = viewBindingWGSL,
  type: ShaderModule = ViewUniformsWGSL,
) => useUniformBinding(uniforms, module, type);

export const useViewUniforms = (
  maybeUniforms?: Record<string, any>,
) => {
  const uniforms = (maybeUniforms ? (useNoOne(), maybeUniforms) : useOne(makeViewUniforms)) as ViewUniforms;
  const {viewPosition, projectionViewFrustum, inverseProjectionViewMatrix} = uniforms;

  const cull = useFrustumCuller(viewPosition, projectionViewFrustum);
  const pick = useFrustumPicker(inverseProjectionViewMatrix);

  return {pick, cull, uniforms};
};
