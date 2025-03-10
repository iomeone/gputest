import type { DataBinding, UniformAttribute, UseGPURenderContext } from '@use-gpu/core';
import type { PassApplyBindGroup, PassBinding, PassBindGroup, PassEnv, PassFlags } from './types';
import type { ShaderModule, ShaderSource } from '@use-gpu/shader';

import { makeBindGroup, makeDataBindingsEntries, makeViewUniforms, makeShaderBinding } from '@use-gpu/core';
import { useHooks, useMemo, useNoMemo, useOne } from '@use-gpu/live';
import { patch, $set } from '@use-gpu/state';

import { getBindGroupLayout } from '../hooks/useBindGroupLayout';
import { useFrustumCuller } from '../hooks/useFrustumCuller';
import { getScratchSource } from '../hooks/useScratchSource';
import { useUniformSource } from '../hooks/useUniformSource';

import { useDeviceContext, useNoDeviceContext } from '../providers/device-provider';
import { usePassContext } from '../providers/pass-provider';
import { useViewContext } from '../providers/view-provider';

import { ViewUniforms as ViewUniformsWGSL } from '@use-gpu/wgsl/use/view.wgsl';
import lightBindingWGSL from '@use-gpu/wgsl/use/light.wgsl';

const NO_OBJECT = {} as Record<string, any>;

export const lightBinding: PassBinding = {
  module: lightBindingWGSL,
  bind: ({light}: PassEnv) => {
    const {lightData} = light?.sources ?? NO_OBJECT;
    return [lightData];
  },
};

export const useMinimalBindGroups = (): Record<string, PassBindGroup> => {
  const viewBinding = useViewContextBinding();

  return useHooks(() => {
    const bindGroup = useStandardBindGroup({bindings: {view: viewBinding}}, {});
    return {
      view: bindGroup,
      color: bindGroup,
    };
  }, [viewBinding]);
};

export const useStandardBindGroups = (
  resources: PassResources,
  flags: PassFlags,
): Record<string, PassBindGroup> => {
  const viewBinding = useViewContextBinding();

  const rs = useMemo(() => patch(resources, {
    bindings: {
      view: $set(viewBinding),
      light: $set(lightBinding),
    },
  }), [resources, viewBinding]);

  const {motion} = flags;

  const view = useStandardBindGroup(rs, {motion});
  const color = useStandardBindGroup(rs, flags);

  return useMemo(() => ({view, color}), [view, color]);
};

export const useStandardBindGroup = (
  resources: PassResources,
  flags: PassFlags = {},
): PassBindGroup => {
  const device = useDeviceContext();

  return useMemo(() => {
    const {motion, lights, shadows, ssao} = flags;

    const {
      bindings: {
        view: viewBinding,
        light: lightBinding,
        motion: motionBinding,
        shadow: shadowBinding,
        ssao: ssaoBinding,
      },
    } = resources;

    const bs = [
      viewBinding,
      motion && motionBinding,
      lights && lightBinding,
      shadows && shadowBinding,
      ssao && ssaoBinding,
    ];
    
    if (!viewBinding) debugger;
    const key = bs.reduce((a, b, i) => a | (b ? (1 << i) : 0), 0);

    return getBindGroupLayout(device, bs, 'PASS', key);
  }, [device, resources, ...Object.values(flags)]);
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
  
  return useApplyPassBindGroup(env, binding, key);
};

export const useApplyPassBindGroup = (
  env: PassEnv,
  passBindGroup: Partial<PassBindGroup>,
  label?: string,
): ApplyPass => {
  const {attributes, layout, bind} = passBindGroup;
  if (attributes == null || bind == null || layout == null) return (useNoApplyPassBindGroup(), {dataBindings: []});
  
  const device = useDeviceContext();

  const values = useMemo(() =>
    bind(env).map((v, i) => {
      const a = attributes[i];
      if (!a) return null;
      if (v == null) throw new Error(`Missing pass binding value for '${a.name}'`);
      return makeShaderBinding(a, v);
    }),
    [attributes, bind, env]
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

export const useViewContextBinding = () => {
  const device = useDeviceContext();
  const {binding: viewBinding} = useViewContext();

  return useMemo(() => {
    if (viewBinding.bind) return viewBinding;

    // If no view provider mounted, provide an empty buffer
    const viewSource = getScratchSource(device, 'f32', {flags: GPUBufferUsage.UNIFORM, reserve: 256})[0];
    return {...viewBinding, bind: () => [viewSource]};
  }, [device, viewBinding]);
};

export const useDynamicViewBinding = (
  passBindGroup: PassBindGroup,
) => {
  const uniforms = useOne(makeViewUniforms);

  const {viewPosition, projectionViewFrustum} = uniforms;
  const cull = useFrustumCuller(viewPosition, projectionViewFrustum);

  const [source, updateView] = useUniformSource(ViewUniformsWGSL);
  const binding = useMemo(() => ({
    ...passBindGroup,
    bind: (env) => [source, ...passBindGroup.bind(env).slice(1)],
  }), [passBindGroup, source]);

  return {binding, cull, uniforms, updateView};
}
