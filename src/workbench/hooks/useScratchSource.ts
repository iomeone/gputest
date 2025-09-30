import type { StorageSource, UniformType } from '@use-gpu/core';

import { useMemo, incrementVersion } from '@use-gpu/live';
import { makeDataBuffer, getUniformArraySize, UNIFORM_ARRAY_DIMS } from '@use-gpu/core';

import { adjustSize } from './useBufferedSize';
import { useDeviceContext } from '../providers/device-provider';

const NO_OPTIONS: ScratchSourceOptions = {};

type ScratchSourceOptions = {
  /** WebGPU buffer flags */
  flags?: GPUFlagsConstant,
  /** Read write access (exclusive) */
  readWrite?: boolean,
  /** Initial allocation size */
  reserve?: number,
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
  } = options;

  const device = useDeviceContext();

  return useMemo(() => {
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
    } as StorageSource;

    allocate(reserve);

    return [source, allocate] as [StorageSource, (x: number) => void];
  }, [device, format, readWrite, flags, volatile]);
};
