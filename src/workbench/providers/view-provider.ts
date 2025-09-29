import type { LiveComponent, PropsWithChildren } from '@use-gpu/live';
import type { DataBounds, ViewUniforms, UniformAttribute } from '@use-gpu/core';

import { provide, signal, yeet, makeContext, useCallback, useContext, useNoContext, useMemo, useRef } from '@use-gpu/live';
import { VIEW_UNIFORMS, makeGlobalUniforms, uploadBuffer, makeBindGroupLayout } from '@use-gpu/core';
import { useDeviceContext } from '../providers/device-provider';
import { useFrustumCuller } from '../hooks/useFrustumCuller';

import { mat4, vec3 } from 'gl-matrix';

const DEFAULT_VIEW_CONTEXT = {
  defs: [] as any,
  uniforms: [] as any,
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

export type ViewProviderProps = {
  defs: UniformAttribute[],
  uniforms: ViewUniforms,
};

export const ViewProvider: LiveComponent<ViewProviderProps> = (props: PropsWithChildren<ViewProviderProps>) => {
  const {defs, uniforms, children} = props;

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
  const cull = useFrustumCuller(viewPosition, projectionViewFrustum);

  const context = useMemo(() => ({
    bind,
    cull,
    layout,
    defs,
    uniforms,
  }), [bindGroup, layout, defs, uniforms]);

  return [
    signal(),
    provide(ViewContext, context, children),
  ];
};

export const useViewContext = () => useContext(ViewContext);
export const useNoViewContext = () => useNoContext(ViewContext);
