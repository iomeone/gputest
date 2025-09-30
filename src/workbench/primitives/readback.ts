import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { StorageSource, TypedArray, UniformType } from '@use-gpu/core';

import { memo, yeet, useOne, useResource } from '@use-gpu/live';
import { getUniformArraySize, getUniformArrayType } from '@use-gpu/core';

import { useDeviceContext } from '../providers/device-provider';
import { useScratchSource } from '../hooks/useScratchSource';

const hasWebGPU = typeof GPUBufferUsage !== 'undefined';

const READBACK_SOURCE = hasWebGPU ? { flags: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ, volatile: true } : {};

export type ReadbackProps = {
  source: StorageSource,
  then?: (data: TypedArray) => LiveElement,

  shouldDispatch?: () => boolean | number | undefined,
  onDispatch?: () => void,
};

export const Readback: LiveComponent<ReadbackProps> = memo((props: ReadbackProps) => {
  const {
    source,
    then,
    shouldDispatch,
    onDispatch,
  } = props;

  const device = useDeviceContext();
  const format = source.format as UniformType;

  const storages = [
    useScratchSource(format, READBACK_SOURCE),
    useScratchSource(format, READBACK_SOURCE),
    useScratchSource(format, READBACK_SOURCE),
  ];

  const mapped = useOne(() => [false, false, false]);
  let requested = -1;

  let dispatchVersion: number | null = null;
  let dispatched = false;

  let cancelled = false;
  useResource((dispose) => dispose(() => cancelled = true));

  return yeet({
    post: () => {
      if (cancelled) return null;
      dispatched = false;

      if (shouldDispatch) {
        const d = shouldDispatch();
        if (d === false) return;
        if (typeof d === 'number') {
          if (dispatchVersion === d) return;
          dispatchVersion = d;
        }
      }
      onDispatch?.();
      dispatched = true;

      const i = requested = mapped.indexOf(false);
      if (i >= 0) {
        const [storage, allocate] = storages[i];
        const byteLength = getUniformArraySize(format, source.length);
        allocate(source.length);

        const commandEncoder = device.createCommandEncoder();
        commandEncoder.copyBufferToBuffer(source.buffer, 0, storage.buffer, 0, byteLength);
        return commandEncoder.finish();
      }
    },
    readback: async () => {
      if (cancelled) return null;
      if (!dispatched) return;

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

        return then ? then(data) : null;
      }
    }
  });
}, 'Readback');
