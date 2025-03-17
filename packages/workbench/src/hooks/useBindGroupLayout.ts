import type { UniformAttribute } from '@use-gpu/core';
import type { PassBinding } from '../pass/types';

import { useMemo } from '@use-gpu/live';
import { makeBindGroupLayout, makeBindGroupLayoutEntries, makeRawBindingForAttribute } from '@use-gpu/core';
import { attributeToFields, bundleToBindings } from '@use-gpu/shader/wgsl';

import { useDeviceContext } from '../providers/device-provider';

export type BindGroupLayout = {
  attributes: UniformAttribute[],
  layout: GPUBindGroupLayout,
};

export const useBindGroupLayout = (
  bindings: (PassBinding | null | undefined)[],
  group: string,
  key?: string,
): BindGroupLayout => {
  const device = useDeviceContext();
  return useMemo(() => getBindGroupLayout(device, bindings, group, key), [device, bindings, group, key]);
};

export const getBindGroupLayout = (
  device: GPUDevice,
  maybeBindings: (Pick<PassBinding, 'module' | 'visibility'> | null | undefined)[],
  group: string,
  key?: string,
): BindGroupLayout => {

  const bindings: PassBinding[] = maybeBindings.filter(s => !!s);
  const bindingIndices: number[][] = [];

  const match = `group(${group})`;

  const allAttributes: UniformAttribute[] = [];
  const allVisibilities: GPUShaderStageFlags[] = [];

  for (const b of bindings) {
    const attributes = bundleToBindings(b.module);
    const visibility = (
      b.visibility === 'vertex' ? GPUShaderStage.VERTEX :
      b.visibility === 'fragment' ? GPUShaderStage.FRAGMENT :
      GPUShaderStage.COMPUTE | GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT
    );

    const indices: number[] = [];
    for (const attribute of attributes) {
      const {attr} = attribute;
      if (!attr.find((k: string) => k === match)) continue;

      const location = attr?.find((k: string) => k.match(/^binding\(/));
      const index = parseInt(location?.split(/[()]/g)[1] ?? '', 10);

      ensureLength(allAttributes, index, null);
      ensureLength(allVisibilities, index, null);
      
      allAttributes[index] = attribute;
      allVisibilities[index] = visibility;
      indices.push(index);
    }

    bindingIndices.push(indices);
  }

  const fields = allAttributes.map(b => b && attributeToFields(b));
  const rawBindings = fields.map(makeRawBindingForAttribute);

  const names = allAttributes.map(a => a?.name ?? '<null>');
  const label = match + '::{' + names.join(', ') + '}';
  
  const entries = makeBindGroupLayoutEntries(rawBindings, allVisibilities);
  const layout = makeBindGroupLayout(device, entries, label);

  return {
    key,
    attributes: allAttributes,
    layout,
    bind: combineBindGroupValues(bindings, bindingIndices),
  };
};

const ensureLength = <T>(list: T[], n: number, v: T) => { while (list.length < n) list.push(v); }

const combineBindGroupValues = (
  bindings: PassBinding[],
  bindingIndices: number[][],
) => (buffers: BuffersEnv, env: PassEnv) => {
  const values = [];

  let i = 0;
  for (const b of bindings) {
    const is = bindingIndices[i];
    const vs = b.bind?.(buffers, env) ?? [];

    const n = is.length;
    for (let j = 0; j < n; ++j) {
      ensureLength(values, is[j], null);
      values[is[j]] = vs[j];
    }

    ++i;
  }

  return values;
};
