import type { UniformPipe, UniformSource } from '@use-gpu/core';
import type { ShaderModule } from '@use-gpu/shader';

import { makeUniformBuffer, makeUniformPipe } from '@use-gpu/core';
import { useMemo } from '@use-gpu/live';
import { bundleToAttribute } from '@use-gpu/shader/wgsl';

import { useDeviceContext } from '../providers/device-provider';

export const useUniformSource = (
  type: ShaderModule,
  n?: number,
) => {
  const device = useDeviceContext();
  return useMemo(() => getUniformSource(device, type, n), [device, type, n]);
}

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
    format: 'T',
    type,
    buffer,
    length: 1,
    size: [1],
    version: 0,

    addressSpace: 'uniform',
  };

  return [source, pipe];
};
