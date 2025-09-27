import type { StorageSource, UniformType, TypedArray } from '@use-gpu/core';

import { useContext, useOne, useMemo, useNoContext, useNoOne, useNoMemo, incrementVersion } from '@use-gpu/live';
import { makeStorageBuffer, uploadBuffer, UNIFORM_ARRAY_DIMS } from '@use-gpu/core';
import { DeviceContext } from '../providers/device-provider';
import { useBufferedSize, useNoBufferedSize } from './useBufferedSize';

// Turn a typed array into a storage source
export const useRawSource = (array: TypedArray, format: UniformType, live: boolean = false) => {
  const device = useContext(DeviceContext);

  const alloc = useBufferedSize(array.byteLength);
  const buffer = useOne(() => makeStorageBuffer(device, alloc), alloc);

  const source = useOne(() => ({
    buffer,
    format,
    length: 0,
    size: [],
    version: 0,
  } as StorageSource), buffer);

  if (live) {
    useNoMemo();
    uploadBuffer(device, buffer, array.buffer);

    source.length = array.length / Math.floor(UNIFORM_ARRAY_DIMS[format]);
    source.size = [source.length];
    source.version = incrementVersion(source.version);
  }
  else {
    useMemo(() => {
      uploadBuffer(device, buffer, array.buffer);

      source.length = array.length / Math.floor(UNIFORM_ARRAY_DIMS[format]);
      source.size = [source.length];
      source.version = incrementVersion(source.version);
    }, [array, buffer]);
  }

  return source;
}

export const useNoRawSource = () => {
  useNoContext(DeviceContext);
  useNoBufferedSize();
  useNoOne();
  useNoOne();
  useNoMemo();
};
