import type { DataBinding, UniformAttribute, UseGPURenderContext } from '@use-gpu/core';
import type { PassApplyBindGroup, PassBindGroup, PassEnv, PassFlags } from './types';
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

import { ViewUniforms as ViewUniformsWGSL } from '@use-gpu/wgsl/use/view.wgsl';
import lightBindingWGSL from '@use-gpu/wgsl/use/light.wgsl';
import shadowBindingWGSL from '@use-gpu/wgsl/use/shadow.wgsl';
import ssaoBindingWGSL from '@use-gpu/wgsl/use/ssao.wgsl';

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
  buffers: Record<string, UseGPURenderContext[]>,
  flags: PassFlags,
): Record<string, PassBindGroup> => {
  const viewContext = useViewContext();

  const view = useStandardBindGroup(viewContext, buffers, {});
  const color = useStandardBindGroup(viewContext, buffers, flags);

  return useMemo(() => ({view, color}), [view, color]);
};

export const useStandardBindGroup = (
  view: {binding: ShaderModule, source: ShaderSource | null},
  buffers: Record<string, UseGPURenderContext[]>,
  flags: PassFlags = {},
): PassBindGroup => {
  const device = useDeviceContext();

  const {binding: viewBindingWGSL, source: viewSource} = view;
  const {lights, shadows, ssao} = flags;

  const key = (+!!lights) + ((+!!shadows) << 1) + ((+!!ssao) << 2);

  const vertex   = [
    viewBindingWGSL,
    lights && lightBindingWGSL
  ].filter(s => !!s) as ShaderModule[];

  const fragment = [
    viewBindingWGSL,
    lights && lightBindingWGSL,
    shadows && shadowBindingWGSL,
    ssao && ssaoBindingWGSL,
  ].filter(s => !!s) as ShaderModule[];

  const {attributes, layout} = getBindGroupLayout(device, [vertex, fragment], 'PASS');

  const resolvedViewSource = viewSource
    ? (useNoScratchSource(), viewSource)
    : useScratchSource('f32', {flags: GPUBufferUsage.UNIFORM, reserve: 256})[0];

  return {
    key,
    attributes,
    layout,
    select: ({light}: PassEnv) => {
      const {lightData, shadowMap} = light?.sources ?? ({} as Record<string, any>);

      return {
        viewUniforms: resolvedViewSource,
        lightUniforms: lightData,
        shadowTexture: shadowMap ? {...shadowMap, sampler: null} : undefined,
        shadowSampler: shadowMap ? {sampler: shadowMap.sampler, filter: shadowMap.filter} : undefined,
        ssaoTexture: ssao ? buffers.ssao[4].source : undefined,
      };
    },
  };
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

  const {bindGroups: {[key]: binding}} = passContext;
  if (!binding) throw new Error(`Cannot find pass binding '${key}'`);
  
  return useApplyPassBindGroup(env, binding, key);
};

export const useApplyPassBindGroup = (
  env: PassEnv,
  binding: Partial<PassBindGroup>,
  label?: string,
): ApplyPass => {
  const {attributes, select, layout} = binding;
  if (attributes == null || select == null || layout == null) return (useNoApplyPassBindGroup(), {dataBindings: []});

  const device = useDeviceContext();

  const dataValues = useMemo(() => {
    const values = select(env);
    for (const a of attributes) if (a && values[a.name] == null) throw new Error(`Missing pass binding value for '${a.name}'`);

    const dataValues = attributes.map((a: UniformAttribute) => a && makeShaderBinding(a, values[a.name]));

    return dataValues;
  }, [attributes, select, env]);
  
  const bindPass = useMemo(() => {
    const entries = makeDataBindingsEntries(device, dataValues);
    const bindGroup = makeBindGroup(device, layout, entries, `PassBindGroup/${label ?? 'Apply'}`);

    return (passEncoder: GPURenderPassEncoder) => {
      passEncoder.setBindGroup(0, bindGroup);
    };
  }, [device, layout, dataValues, label]);
  
  return {bindPass, dataBindings: dataValues, layout};
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
