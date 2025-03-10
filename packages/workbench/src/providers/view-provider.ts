import type { LiveComponent, PropsWithChildren, Ref } from '@use-gpu/live';
import type { ViewUniforms } from '@use-gpu/core';
import type { ShaderModule, ShaderSource } from '@use-gpu/shader';

import { provide, makeContext, useContext, useNoContext, useMemo } from '@use-gpu/live';
import { makeViewUniforms } from '@use-gpu/core';

import { useUniformSource } from '../hooks/useUniformSource';
import { makeViewBinding } from '../pass/bindings';
import { useDeviceContext } from '../providers/device-provider';
import { useFrustumCuller, useNoFrustumCuller } from '../hooks/useFrustumCuller';
import { QueueReconciler } from '../reconcilers/index';

import { vec3 } from 'gl-matrix';

import viewBinding, { ViewUniforms as ViewUniformsWGSL } from '@use-gpu/wgsl/use/view.wgsl';

const {signal} = QueueReconciler;

const DEFAULT_VIEW_CONTEXT = {
  uniforms: makeViewUniforms(),
  binding: {module: viewBinding},
  cull: () => true,
} as ViewContextProps;

export const ViewContext = makeContext<ViewContextProps>(DEFAULT_VIEW_CONTEXT, 'ViewContext');

export type ViewContextProps = {
  uniforms: ViewUniforms,
  binding: ShaderModule,
  cull: (center: vec3 | number[], radius: number) => number | boolean,
};

export type ViewProviderProps = PropsWithChildren<{
  uniforms: Record<string, Ref<any>>,
  binding?: ShaderModule,
  type?: ShaderModule,
  cull?: boolean,
}>;

export const ViewProvider: LiveComponent<ViewProviderProps> = (props: ViewProviderProps) => {
  const {
    uniforms,
    binding = viewBinding,
    type = ViewUniformsWGSL,
    cull: cullProp = true,

    children,
  } = props;
  
  const device = useDeviceContext();

  const {projectionViewFrustum, viewPosition} = uniforms;
  const cull = cullProp
    ? useFrustumCuller(viewPosition, projectionViewFrustum)
    : (useNoFrustumCuller(), () => true);

  const [source, update] = useUniformSource(type);
  update(uniforms);

  const context = useMemo(() => ({
    uniforms,
    binding: {
      module: binding,
      type,
      bind: () => [source],
    },
    cull,
  }), [uniforms, binding, source, cull]);

  return [
    signal(),
    provide(ViewContext, context, children),
  ];
};

export const useViewContext = () => useContext(ViewContext);
export const useNoViewContext = () => useNoContext(ViewContext);

export const useMakeViewUniforms = () => {
  const uniforms = useOne(makeViewUniforms);

  const {viewPosition, projectionViewFrustum} = uniforms;
  const cull = useFrustumCuller(viewPosition, projectionViewFrustum);
  
  return {cull, uniforms};
};
