import type { StorageSource, UniformType, TensorArray, TypedArray } from '@use-gpu/core';

import { useOne, useMemo, useVersion, useNoOne, useNoMemo, useNoVersion, incrementVersion } from '@use-gpu/live';
import { makeDataBuffer, uploadBuffer, UNIFORM_ARRAY_DIMS } from '@use-gpu/core';

import { useDeviceContext, useNoDeviceContext } from '../providers/device-provider';
import { useBufferedSize, useNoBufferedSize } from './useBufferedSize';

const NO_OPTIONS: RawSourceOptions = {};
const NO_SIZE: number[] = [];

type RawSourceOptions = {
  flags?: GPUFlagsConstant,
  readWrite?: boolean,
  live?: boolean,
};

// Turn a typed array into a storage source
export const useRawSource = (
  array: TypedArray,
  format: UniformType,
  options: RawSourceOptions = NO_OPTIONS,
  size?: number[],
  version: number = 0,
) => {
  const {
    live,
    readWrite,
    flags = GPUBufferUsage.STORAGE,
  } = options;

  const device = useDeviceContext();

  const alloc = useBufferedSize(array.byteLength);
  const buffer = useOne(() => makeDataBuffer(device, alloc, flags), alloc);

  const memoKey = useVersion(buffer) + useVersion(readWrite);
  const source = useOne(() => ({
    buffer,
    format,
    length: 0,
    size: [],
    version: 0,
    readWrite,
  } as StorageSource), memoKey);

  if (live) {
    useNoMemo();
    uploadBuffer(device, buffer, array.buffer);

    source.length = array.length / Math.floor(UNIFORM_ARRAY_DIMS[format]);
    source.size = size ?? [source.length];
    source.version = incrementVersion(source.version);
  }
  else {
    useMemo(() => {
      uploadBuffer(device, buffer, array.buffer);

      source.length = array.length / Math.floor(UNIFORM_ARRAY_DIMS[format]);
      source.size = size ?? [source.length];
      source.version = incrementVersion(source.version);
    }, [array, buffer, version, ...size ?? NO_SIZE]);
  }

  return source;
}

export const useNoRawSource = () => {
  useNoDeviceContext();
  useNoBufferedSize();
  useNoOne();
  useNoVersion();
  useNoVersion();
  useNoOne();
  useNoMemo();
};

export const useRawTensorSource = (data: TensorArray, options: RawSourceOptions = NO_OPTIONS) =>
  useRawSource(data.array, data.format, options, data.size as number[], data.version);

export const useNoRawTensorSource = useNoRawSource;
