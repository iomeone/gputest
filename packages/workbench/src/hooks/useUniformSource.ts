import type { UniformPipe, UniformSource } from '@use-gpu/core';
import type { ShaderModule } from '@use-gpu/shader';

import { makeUniformBuffer, makeUniformPipe, uploadBuffer } from '@use-gpu/core';
import { useMemo } from '@use-gpu/live';
import { bundleToAttribute } from '@use-gpu/shader/wgsl';

import { useDeviceContext } from '../providers/device-provider';

/**
Make a uniform-backed source for a WGSL type.
Returns a [source, updater] tuple that accepts key/value pairs.
*/
export const useUniformSource = (
  type: ShaderModule,
  n?: number,
) => {
  const device = useDeviceContext();
  return useMemo(() => getUniformSource(device, type, n), [device, type, n]);
}

/**
Make a uniform-backed source for a WGSL type.
Returns a [source, updater] tuple that accepts key/value pairs.
*/
export const getUniformSource = (
  device: GPUDevice,
  type: ShaderModule,
  n: number = 1,
): [UniformSource, UniformPipe] => {
  const attr = bundleToAttribute(type);
  const defs = attr.format;
  if (!Array.isArray(defs)) throw new Error(`Invalid uniform struct type '${attr.name}'`);
  
  const pipe = makeUniformPipe(defs, n);
  const buffer = makeUniformBuffer(device, pipe.data);

  const source: UniformSource = {
    format: n > 1 ? 'array<T>' : 'T',
    type,
    buffer,
    length: n,
    size: [n],
    version: 0,

    addressSpace: 'uniform',
  };

  const update = (values: Record<string, any> | Record<string, any>[]) => {
    pipe.fill(values);
    uploadBuffer(device, buffer, pipe.data);
  };

  return [source, update];
};
