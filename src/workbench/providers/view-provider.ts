import type { LiveComponent, PropsWithChildren } from '@use-gpu/live';
import type { ViewUniforms, UniformAttribute } from '@use-gpu/core';

import { provide, makeContext, useCallback, useContext, useNoContext, useMemo } from '@use-gpu/live';
import { makeGlobalUniforms, uploadBuffer } from '@use-gpu/core';
import { useDeviceContext } from '../providers/device-provider';
import { useFrustumCuller, useNoFrustumCuller } from '../hooks/useFrustumCuller';
import { QueueReconciler } from '../reconcilers/index';

import { vec3 } from 'gl-matrix';

const {signal} = QueueReconciler;

const DEFAULT_VIEW_CONTEXT = {
  defs: [] as any,
  uniforms: {} as any,
  layout: null as any,
  cull: () => true,
  bind: (() => {}) as any,
} as ViewContextProps;

export const ViewContext = makeContext<ViewContextProps>(DEFAULT_VIEW_CONTEXT, 'ViewContext');

export type ViewContextProps = {
  defs: UniformAttribute[],
  uniforms: ViewUniforms,
  layout?: GPUBindGroupLayout,
  bind: (passEncoder: GPURenderPassEncoder) => void,
  cull: (center: vec3 | number[], radius: number) => number | boolean,
};

export type ViewProviderProps = PropsWithChildren<{
  defs: UniformAttribute[],
  uniforms: ViewUniforms,
  cull?: boolean,
}>;

export const ViewProvider: LiveComponent<ViewProviderProps> = (props: ViewProviderProps) => {
  const {
    defs,
    uniforms,
    cull: cullProp,
    children,
  } = props;

  const device = useDeviceContext();

  const binding = useMemo(() =>
    makeGlobalUniforms(device, [defs]),
    [device, defs]);

  const {bindGroup, layout, buffer, pipe} = binding;
  pipe.fill(uniforms);
  uploadBuffer(device, buffer, pipe.data);

  const bind = useCallback((passEncoder: GPURenderPassEncoder) => {
    passEncoder.setBindGroup(0, bindGroup);
  }, [bindGroup]);

  const {projectionViewFrustum, viewPosition} = uniforms;
  const cull = !cullProp
    ? useFrustumCuller(viewPosition, projectionViewFrustum)
    : (useNoFrustumCuller(), cullProp);

  const context = useMemo(() => ({
    bind,
    cull,
    layout,
    defs,
    uniforms,
  }), [bindGroup, cull, layout, defs, uniforms]);

  return [
    signal(),
    provide(ViewContext, context, children),
  ];
};

export const useViewContext = () => useContext(ViewContext);
export const useNoViewContext = () => useNoContext(ViewContext);
