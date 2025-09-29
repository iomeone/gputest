import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { StorageSource, TypedArray } from '@use-gpu/core';

import { use, memo, yeet, useMemo, useOne } from '@use-gpu/live';
import { getDataArrayByteLength, getDataArrayConstructor } from '@use-gpu/core';

import { useDeviceContext } from '../providers/device-provider';
import { useScratchSource } from '../hooks/useScratchSource';

const hasWebGPU = typeof GPUBufferUsage !== 'undefined';

const READBACK_SOURCE = hasWebGPU ? { flags: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ } : {};

export type ReadbackProps = {
  source: StorageSource,
  then?: (data: TypedArray) => LiveElement,
};

export const Readback: LiveComponent<ReadbackProps> = memo((props: ReadbackProps) => {
  const {source, then} = props;

  const device = useDeviceContext();

  const storages = [
    useScratchSource(source.format, READBACK_SOURCE),
    useScratchSource(source.format, READBACK_SOURCE),
    useScratchSource(source.format, READBACK_SOURCE),
  ];

  const mapped = useOne(() => [false, false, false]);
  let requested = -1;

  return yeet({
    post: () => {
      const i = requested = mapped.indexOf(false);
      if (i >= 0) {
        const [storage, allocate] = storages[i];
        const byteLength = getDataArrayByteLength(source.format, source.length);
        allocate(source.length);

        const commandEncoder = device.createCommandEncoder();
        commandEncoder.copyBufferToBuffer(source.buffer, 0, storage.buffer, 0, byteLength);
        return commandEncoder.finish();
      }
    },
    readback: async () => {
      const i = requested;
      if (i >= 0) {
        const [storage] = storages[i];
        const {buffer} = storage;

        mapped[i] = true;
        await buffer.mapAsync(GPUMapMode.READ);

        const ctor = getDataArrayConstructor(source.format);
        const array = new ctor(buffer.getMappedRange());
        const data = array.slice();

        buffer.unmap();
        mapped[i] = false;

        return then ? then(data) : null;
      }
    }
  });
}, 'Readback');
