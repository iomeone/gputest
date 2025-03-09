import type { DataBinding, UniformAttribute, UseGPURenderContext } from '@use-gpu/core';
import type { BuffersEnv, PassApplyBindGroup, PassBinding, PassBindGroup, PassEnv, PassFlags } from './types';
import type { ShaderModule, ShaderSource } from '@use-gpu/shader';

import { makeBindGroup, makeDataBindingsEntries, makeViewUniforms, makeShaderBinding } from '@use-gpu/core';
import { useHooks, useMemo, useNoMemo, useOne } from '@use-gpu/live';

import { getBindGroupLayout } from '../hooks/useBindGroupLayout';
import { useFrustumCuller } from '../hooks/useFrustumCuller';
import { useScratchSource, useNoScratchSource } from '../hooks/useScratchSource';
import { useUniformSource } from '../hooks/useUniformSource';

import { useDeviceContext, useNoDeviceContext } from '../providers/device-provider';
import { usePassContext } from '../providers/pass-provider';
import { useViewContext } from '../providers/view-provider';

import lightBindingWGSL, { LightUniforms as LightUniformsWGSL } from '@use-gpu/wgsl/use/light.wgsl';
import shadowBindingWGSL from '@use-gpu/wgsl/use/shadow.wgsl';
import ssaoBindingWGSL from '@use-gpu/wgsl/use/ssao.wgsl';
import motionBindingWGSL, { MotionUniforms as MotionUniformsWGSL } from '@use-gpu/wgsl/use/motion.wgsl';

export const lightBinding: PassBinding = {
  module: lightBindingWGSL,
  type: LightUniformsWGSL,
  bind: (buffers: BuffersEnv, {light}: PassEnv) => {
    const {lightData} = light?.sources ?? ({} as Record<string, any>);
    return lightData ? [lightData] : [null];
  },
};

export const shadowBinding: PassBinding = {
  module: shadowBindingWGSL,
  visibility: 'fragment',
  bind: (buffers: BuffersEnv, {light}: PassEnv) => {
    const {lightData, shadowMap} = light?.sources ?? ({} as Record<string, any>);

    return shadowMap ? [
      {...shadowMap, sampler: null},
      {sampler: shadowMap.sampler, filter: shadowMap.filter},
    ] : [null, null];
  },
};

export const ssaoBinding: PassBinding = {
  module: ssaoBindingWGSL,
  visibility: 'fragment',
  bind: (buffers: BuffersEnv) => buffers.ssao ? [buffers.ssao[4].source] : [null],
};

export const motionBinding: PassBinding = {
  module: motionBindingWGSL,
  type: MotionUniformsWGSL,
  bind: (buffers: BuffersEnv) => buffers.motion ? [buffers.motion[0].source] : [null],
};

export const useMinimalBindGroups = (): Record<string, PassBindGroup> => {
  const view = useViewContext();

  return useHooks(() => {
    const bindGroup = useStandardBindGroup(view, {}, {});
    return {
      view: bindGroup,
      color: bindGroup,
    };
  }, []);
};

export const useStandardBindGroups = (
  buffers: BuffersEnv,
  flags: PassFlags,
): Record<string, PassBindGroup> => {
  const viewContext = useViewContext();

  const view = useStandardBindGroup(viewContext, {});
  const color = useStandardBindGroup(viewContext, flags);

  return useMemo(() => ({view, color}), [view, color]);
};

export const useStandardBindGroup = (
  view: PassBinding,
  flags: PassFlags = {},
): PassBindGroup => {
  const device = useDeviceContext();

  const {binding: viewBinding} = view;
  const {motion, lights, shadows, ssao} = flags;

  let resolvedViewBinding = viewBinding;
  if (!viewBinding.bind) {
    const viewSource = useScratchSource('f32', {flags: GPUBufferUsage.UNIFORM, reserve: 256})[0];
    resolvedViewBinding = {...viewBinding, bind: () => [viewSource]};
  }
  else {
    useNoScratchSource();
  }

  const maybeBindings = [
    resolvedViewBinding,
    motion && motionBinding,
    lights && lightBinding,
    shadows && shadowBinding,
    ssao && ssaoBinding,
  ];

  const key = maybeBindings.reduce((a, b, i) => a | (b != null ? (1 << i) : 0), 0);

  return getBindGroupLayout(device, maybeBindings, 'PASS', key);
};

type ApplyPass = {
  bindPass?: PassApplyBindGroup,
  dataBindings: DataBinding[],
};

export const useApplyPass = (
  env: PassEnv,
  key: string,
): ApplyPass => {
  const passContext = usePassContext();

  const {buffers, bindGroups: {[key]: binding}} = passContext;
  if (!binding) throw new Error(`Cannot find pass binding '${key}'`);
  
  return useApplyPassBindGroup(buffers, env, binding, key);
};

export const useApplyPassBindGroup = (
  buffers: BuffersEnv,
  env: PassEnv,
  binding: Partial<PassBindGroup>,
  label?: string,
): ApplyPass => {
  const {attributes, layout, bind} = binding;
  if (attributes == null || bind == null || layout == null) return (useNoApplyPassBindGroup(), {dataBindings: []});

  const device = useDeviceContext();

  const values = useMemo(() =>
    bind(buffers, env).map((v, i) => {
      const a = attributes[i];
      if (!a) return null;
      if (v == null) throw new Error(`Missing pass binding value for '${a.name}'`);
      return makeShaderBinding(a, v);
    }),
    [attributes, bind, buffers, env]
  );

  const bindPass = useMemo(() => {
    const entries = makeDataBindingsEntries(device, values);
    const bindGroup = makeBindGroup(device, layout, entries, `PassBindGroup/${label ?? 'Apply'}`);

    return (passEncoder: GPURenderPassEncoder) => {
      passEncoder.setBindGroup(0, bindGroup);
    };
  }, [device, layout, values, label]);
  
  return {bindPass, dataBindings: values};
};

export const useNoApplyPassBindGroup = () => {
  useNoDeviceContext();
  useNoMemo();
  useNoMemo();
};

export const useDynamicViewBinding = (
  viewBinding: PassBindGroup,
  type: ShaderModule = ViewUniformsWGSL,
) => {
  const uniforms = useOne(makeViewUniforms);

  const {viewPosition, projectionViewFrustum} = uniforms;
  const cull = useFrustumCuller(viewPosition, projectionViewFrustum);

  const [source, pipe] = useUniformSource(type);
  const binding = useMemo(() => ({
    ...viewBinding,
    select: (env: PassEnv) => ({...viewBinding.select(env), viewUniforms: source}),
  }), [viewBinding, source]);

  return {binding, cull, pipe, source, uniforms};
}
