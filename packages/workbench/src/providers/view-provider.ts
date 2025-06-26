import type { LiveComponent, PropsWithChildren, Ref } from '@use-gpu/live';
import type { XYZ, ViewUniforms } from '@use-gpu/core';
import type { ShaderModule } from '@use-gpu/shader';
import type { PointerEvent } from '../interact/event';
import type { PassBinding } from '../pass/types';

import { provide, makeContext, useContext, useNoContext, useMemo, useOne, useNoOne } from '@use-gpu/live';
import { makeViewUniforms } from '@use-gpu/core';

import { useUniformBinding } from '../hooks/useUniformSource';
import { useFrustumCuller } from '../hooks/useFrustumCuller';
import { useFrustumPicker } from '../hooks/useFrustumPicker';
import { QueueReconciler } from '../reconcilers/index';

import { vec3 } from 'gl-matrix';

import viewBindingWGSL, { ViewUniforms as ViewUniformsWGSL } from '@use-gpu/wgsl/use/view.wgsl';
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
  cull: (center: vec3 | number[], radius: number) => number | boolean,
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
