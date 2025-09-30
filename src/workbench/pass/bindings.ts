import type { DataBinding } from '../../core';
import type { PassApplyBindGroup, PassBindGroup, PassBinding, PassEnv, PassFlags, PassResources } from './types';

import { makeBindGroup, makeDataBindingsEntries, makeShaderBinding, ViewUniforms } from '../../core';
import { useMemo, useNoMemo, useOne } from '../../live';
import { toMurmur53 } from '../../state';

import { getBindGroupLayout } from '../hooks/useBindGroupLayout';
import { useUniformSource } from '../hooks/useUniformSource';

import { useDeviceContext, useNoDeviceContext } from '../providers/device-provider';
import { useViewUniforms } from '../providers/view-provider';

import { ViewUniforms as ViewUniformsWGSL } from '../../wgsl/use/view.wgsl';

export const useMinimalBindGroups = (
  resources: PassResources,
): Record<string, PassBindGroup> => {
  const bindGroup = useStandardBindGroup(resources, {});
  return useOne(() => ({
    view: bindGroup,
    pre: bindGroup,
    color: bindGroup,
  }), bindGroup);
};

export const useStandardBindGroups = (
  resources: PassResources,
  flags: PassFlags,
): Record<string, PassBindGroup> => {
  const {overscan, lights, shadows, ssao} = flags;

  const pre = useStandardBindGroup(resources, {overscan});
  const view = useStandardBindGroup(resources, {});
  const color = useStandardBindGroup(resources, {lights, shadows, ssao});

  return useMemo(() => ({view, pre, color}), [view, pre, color]);
};

export const useStandardBindGroup = (
  resources: PassResources,
  flags: PassFlags = {},
): PassBindGroup => {
  const device = useDeviceContext();
  const flagsKey = toMurmur53(flags);

  return useMemo(() => {
    const {lights, shadows, ssao, overscan} = flags;

    const {
      bindings: {
        view: viewBinding,
        overscan: overscanBinding,
        light: lightBinding,
        shadow: shadowBinding,
        ssao: ssaoBinding,
      },
    } = resources;

    const resolvedBindings = [
      overscan ? overscanBinding : viewBinding,
      lights ? lightBinding : null,
      shadows ? shadowBinding : null,
      ssao ? ssaoBinding : null,
    ];

    const pipelineKey = resolvedBindings.reduce(
      (a: number, b: PassBinding | null | undefined, i: number) => (
        a | (b ? (1 << i) : 0)
      ), 0);

    return getBindGroupLayout(device, resolvedBindings, 'PASS', pipelineKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device, resources, flagsKey]);
};

type ApplyPass = {
  bindPass?: PassApplyBindGroup,
  dataBindings: (DataBinding | null)[],
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

export const useDynamicViewBinding = (
  passBindGroup: PassBindGroup,
  maybeUniforms?: ViewUniforms,
) => {
  if (!passBindGroup) throw new Error("Missing bind group");

  const {cull, uniforms} = useViewUniforms(maybeUniforms);

  const [source, upload] = useUniformSource(ViewUniformsWGSL);
  const bindGroup = useMemo(() => ({
    ...passBindGroup,
    bind: (env: PassEnv) => [source, ...(passBindGroup.bind?.(env) ?? []).slice(1)],
  }), [passBindGroup, source]);

  return {bindGroup, cull, uniforms, upload};
}
