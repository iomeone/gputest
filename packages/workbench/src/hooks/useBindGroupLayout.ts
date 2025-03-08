import type { UniformAttribute } from '@use-gpu/core';
import type { ShaderModule } from '@use-gpu/shader';

import { useMemo } from '@use-gpu/live';
import { makeBindGroupLayout, makeBindGroupLayoutEntries, makeRawBindingForAttribute, mergeAttributeBindings } from '@use-gpu/core';
import { bundleToBindings } from '@use-gpu/shader/wgsl';

import { useDeviceContext } from '../providers/device-provider';

export type BindGroupLayout = {
  attributes: UniformAttribute[],
  layout: GPUBindGroupLayout,
};

export const useBindGroupLayout = (
  stages: (ShaderModule | null | undefined)[][],
  group: string,
): BindGroupLayout => {
  const device = useDeviceContext();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => getBindGroupLayout(device, stages, group), [device, group, ...stages]);
};

export const getBindGroupLayout = (
  device: GPUDevice,
  stages: (ShaderModule | null | undefined)[][],
  group: string,
): BindGroupLayout => {
  const bindings = stages.map(stage => stage.filter(s => !!s).flatMap((b) => bundleToBindings(b as ShaderModule)));

  const key = `group(${group})`;
  const [attributes, visibilities] = mergeAttributeBindings(bindings, key);
  const rawBindings = attributes.map(makeRawBindingForAttribute);

  const names = attributes.map(a => a.name);
  const label = [key, '::{', names.join(', '), '}'].join('');
  
  const entries = makeBindGroupLayoutEntries(rawBindings, visibilities);
  const layout = makeBindGroupLayout(device, entries, label);

  return {attributes, layout};
};
