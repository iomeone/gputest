import type { UniformAttribute } from '../../core';
import type { PassBindGroup, PassBinding, PassEnv } from '../pass/types';

import { useMemo } from '../../live';
import { makeBindGroupLayout, makeBindGroupLayoutEntries, makeRawBindingForAttribute } from '../../core';
import { attributeToFields, bundleToBindings } from '../../shader/wgsl';

import { useDeviceContext } from '../providers/device-provider';

export const useBindGroupLayout = (
  bindings: (PassBinding | null | undefined)[],
  group: string,
  key: string | number,
): PassBindGroup => {
  const device = useDeviceContext();
  return useMemo(() => getBindGroupLayout(device, bindings, group, key), [device, bindings, group, key]);
};

export const getBindGroupLayout = (
  device: GPUDevice,
  maybeBindings: (PassBinding | null | undefined)[],
  group: string,
  key: string | number,
): PassBindGroup => {

  const bindings = maybeBindings.filter(s => !!s) as PassBinding[];
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
      if (!attr || !attr.find((k: string) => k === match)) continue;

      const location = attr.find((k: string) => k.match(/^binding\(/));
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
) => (env: PassEnv) => {
  const values = [];

  let i = 0;
  for (const b of bindings) {
    const is = bindingIndices[i];
    const vs = b.bind?.(env) ?? [];

    const n = is.length;
    for (let j = 0; j < n; ++j) {
      ensureLength(values, is[j], null);
      values[is[j]] = vs[j];
    }

    ++i;
  }

  return values;
};
