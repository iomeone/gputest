import type { LambdaSource, StorageSource, UniformType } from '@use-gpu/core';
import type { ShaderModule } from '@use-gpu/shader';
import type { ArrowFunction, Task } from '@use-gpu/live';

import { useMemo, useOne, incrementVersion } from '@use-gpu/live';
import { resolve, makeDataBuffer, getDataArrayByteLength, UNIFORM_ARRAY_DIMS } from '@use-gpu/core';

import { adjustSize } from './useBufferedSize';
import { useDeviceContext } from '../providers/device-provider';

const NO_OPTIONS: ScratchSourceOptions = {};

type ScratchSourceOptions = {
  flags?: GPUFlagsConstant,
  readWrite?: boolean,
  reserve?: number,
};

export const useScratchSource = (
  format: UniformType,
  options: ScratchSourceOptions = NO_OPTIONS,
) => {
  const {
    readWrite = false,
    reserve = 16,
    flags = GPUBufferUsage.STORAGE,
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
        const byteLength = getDataArrayByteLength(f, alloc || 1);
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
      volatile: 1,
    } as StorageSource;

    allocate(reserve);

    return [source, allocate] as [StorageSource, (x: number) => void];
  }, [device, format, readWrite, flags]);
};
