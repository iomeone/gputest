import type { StorageSource, UniformSource, UniformType } from '@use-gpu/core';

import { useMemo, useNoMemo, incrementVersion } from '@use-gpu/live';
import { makeDataBuffer, getUniformArraySize, UNIFORM_ARRAY_DIMS } from '@use-gpu/core';

import { adjustSize } from './useBufferedSize';
import { useDeviceContext, useNoDeviceContext } from '../providers/device-provider';

const NO_OPTIONS: ScratchSourceOptions = {};

type ScratchSourceOptions = {
  /** WebGPU buffer flags */
  flags?: GPUFlagsConstant,
  /** Read write access (exclusive) */
  readWrite?: boolean,
  /** Initial allocation size */
  reserve?: number,
  /** Declarative allocation size */
  length?: number,
  /** Resizable binding */
  volatile?: boolean,
};

export const useScratchSource = (
  format: UniformType,
  options: ScratchSourceOptions = NO_OPTIONS,
) => {
  const {
    readWrite = false,
    reserve = 16,
    flags = GPUBufferUsage.STORAGE,
    volatile = false,
    length,
  } = options;

  const device = useDeviceContext();

  const scratchSource = useMemo(() =>
    getScratchSource(device, format, options),
    // Unpack options
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [device, format, readWrite, reserve, flags, volatile]
  );

  const [, allocate] = scratchSource;
  if (length != null) allocate(length);

  return scratchSource;
};

export const useNoScratchSource = () => {
  useNoDeviceContext();
  useNoMemo();
};

export const getScratchSource = (
  device: GPUDevice,
  format: UniformType,
  options: ScratchSourceOptions = NO_OPTIONS,
) => {
  const {
    readWrite = false,
    reserve = 16,
    flags = GPUBufferUsage.STORAGE,
    volatile = false,
    length,
  } = options;

  const f = (format && (format in UNIFORM_ARRAY_DIMS)) ? format as UniformType : 'f32';
  let alloc = 0;

  const allocate = (
    length: number,
  ) => {
    const newAlloc = adjustSize(length, alloc);

    if (alloc !== newAlloc) {
      alloc = newAlloc;
      const byteLength = getUniformArraySize(f, alloc || 1);
      source.buffer = makeDataBuffer(device, byteLength, flags);
    }

    source.length = length;
    source.size = [length];
    source.version = incrementVersion(source.version);
  };

  const source = {
    buffer: null as any,
    format: f,
    length: 0,
    size: [0],
    version: 0,
    readWrite,
    volatile: +volatile,

    addressSpace: (flags & GPUBufferUsage.UNIFORM) ? 'uniform' : 'storage',
  } as StorageSource | UniformSource;

  allocate(length ?? reserve);

  return [source, allocate] as [StorageSource | UniformSource, (x: number) => void];
}
