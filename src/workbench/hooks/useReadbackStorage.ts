import type { StorageSource, UniformType } from '../../core';

import { useMemo, useOne, useResource } from '../../live';

import { seq, getUniformArraySize, getUniformArrayType } from '../../core';

import { getScratchSource } from '../hooks/useScratchSource';
import { useDeviceContext } from '../providers/device-provider';

const READBACK_SOURCE = { flags: GPUBufferUsage?.COPY_DST | GPUBufferUsage?.MAP_READ, volatile: true };

export const useReadbackStorage = (
  source: StorageSource,
  buffers: number = 3,
) => {
  const device = useDeviceContext();
  const format = source.format as UniformType;

  const storages = useMemo(() =>
    seq(buffers).map(() => getScratchSource(device, format, READBACK_SOURCE)),
    [buffers, device, format]
  );

  let requested = -1;
  const mapped = useOne(() => seq(buffers).map(() => false));

  let cancelled = false;
  useResource((dispose) => dispose(() => cancelled = true));

  const dispatchCopy = () => {
    if (cancelled) return null;

    const i = requested = mapped.indexOf(false);
    if (i >= 0) {
      const [storage, allocate] = storages[i];
      const byteLength = getUniformArraySize(format, source.length);
      allocate(source.length);

      const commandEncoder = device.createCommandEncoder();
      commandEncoder.copyBufferToBuffer(source.buffer, 0, storage.buffer, 0, byteLength);
      return commandEncoder.finish();
    }
    else {
      console.warn(`Ran out of readback buffers`);
    }
  };

  const asyncRead = async () => {
    const i = requested;
    if (i >= 0) {
      const [storage] = storages[i];
      const {buffer} = storage;

      mapped[i] = true;
      await buffer.mapAsync(GPUMapMode.READ);

      if (cancelled) return null;

      const ctor = getUniformArrayType(format);
      const array = new ctor(buffer.getMappedRange());
      const data = array.slice();

      buffer.unmap();
      mapped[i] = false;

      return data;
    }

    return null;
  };

  return {dispatchCopy, asyncRead};
};
