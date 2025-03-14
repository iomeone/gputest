import type { LiveComponent, PropsWithChildren, Ref } from '@use-gpu/live';
import type { ViewUniforms } from '@use-gpu/core';
import type { ShaderModule, ShaderSource } from '@use-gpu/shader';
import type { PassBinding } from '../pass/types';

import { provide, makeContext, useCallback, useContext, useNoContext, useMemo, useOne, useNoOne } from '@use-gpu/live';
import { makeViewUniforms } from '@use-gpu/core';

import { useUniformBinding } from '../hooks/useUniformSource';
import { makeViewBinding } from '../pass/bindings';
import { useDeviceContext } from '../providers/device-provider';
import { useFrustumCuller, useNoFrustumCuller } from '../hooks/useFrustumCuller';
import { QueueReconciler } from '../reconcilers/index';

import { vec3 } from 'gl-matrix';

import viewBindingWGSL, { ViewUniforms as ViewUniformsWGSL } from '@use-gpu/wgsl/use/view.wgsl';
import { useInspectable } from '../hooks/useInspectable'

const {signal} = QueueReconciler;

const DEFAULT_VIEW_CONTEXT = {
  uniforms: makeViewUniforms(),
  binding: {module: viewBindingWGSL},
  cull: () => true,
} as ViewContextProps;

export const ViewContext = makeContext<ViewContextProps>(DEFAULT_VIEW_CONTEXT, 'ViewContext');

export type ViewContextProps = {
  uniforms: ViewUniforms,
  binding: PassBinding,
  cull: (center: vec3 | number[], radius: number) => number | boolean,
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

  const device = useDeviceContext();
  const inspect = useInspectable();

  const {cull, uniforms} = useViewUniforms(maybeUniforms);
  const {binding, upload} = useViewBinding(uniforms);
  upload();

  const context = useMemo(() => ({
    binding,
    cull,
    uniforms,
  }), [binding, cull, uniforms]);

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
  const uniforms = maybeUniforms ? (useNoOne(), maybeUniforms) : useOne(makeViewUniforms);
  const {viewPosition, projectionViewFrustum} = uniforms;
  const cull = useFrustumCuller(viewPosition, projectionViewFrustum);

  return {cull, uniforms};
};
