import type { LiveComponent, LiveElement, PropsWithChildren } from '@use-gpu/live';
import type { StorageSource, StorageTarget, UniformType } from '@use-gpu/core';

import { seq, getUniformArraySize, makeDataBuffer } from '@use-gpu/core';
import { provide, fence, yeet, useContext, useMemo, incrementVersion } from '@use-gpu/live';
import { RenderContext } from '../providers/render-provider';
import { DeviceContext } from '../providers/device-provider';
import { ComputeContext } from '../providers/compute-provider';

export type ComputeBufferProps = PropsWithChildren<{
  width?: number,
  height?: number,
  depth?: number,
  history?: number,
  format?: UniformType,
  resolution?: number,
  label?: string,

  render?: (source: StorageTarget) => LiveElement,
  then?: (source: StorageTarget) => LiveElement,
}>;

/** Read-write GPU storage buffer for compute. Will perform frame-buffer flipping with N frames of history. */
export const ComputeBuffer: LiveComponent<ComputeBufferProps> = (props: ComputeBufferProps) => {
  const device = useContext(DeviceContext);
  const renderContext = useContext(RenderContext);

  const {
    resolution = 1,
    width = Math.floor(renderContext.width * resolution),
    height = Math.floor(renderContext.height * resolution),
    depth = 1,
    format = 'f32',
    history = 0,
    label,
    render,
    children,
    then,
  } = props;

  const length = width * height * depth;

  const [buffer, buffers, counter] = useMemo(
    () => {
      const flags = GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST;
      const byteLength = getUniformArraySize(format, length);
      const buffer = makeDataBuffer(device, byteLength, flags);

      const buffers = history > 0 ? seq(history).map(() =>
        makeDataBuffer(device, byteLength, flags)
      ) : undefined;
      if (buffers) buffers.push(buffer);

      let i = 0;
      if (buffers) for (const b of buffers) b.label = [label ?? 'computeBuffer', 'history', ++i].filter(s => s != null).join(' ');
      buffer.label = label ?? 'computeBuffer';

      const counter = { current: 0 };
      return [buffer, buffers, counter];
    },
    [device, width, height, depth, format, history]
  );

  const targetBuffer = buffer;

  const source = useMemo(() => {
    const size = [width, height, depth] as [number, number, number];
    const volatile = history ? history + 1 : 0;

    const swap = () => {
      if (!history) return;

      const {current: index} = counter;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const n = buffers!.length;

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      source.buffer = buffers![index];

      for (let i = history - 1; i >= 0; i--) {
        const j = (index + n - i - 1) % n;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        sources![i].buffer = buffers![j];
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        sources![i].version = i ? sources![i - 1].version : source.version;
      }

      source.version = incrementVersion(source.version);

      counter.current = (index + 1) % n;
    };

    const makeSource = (readWrite: boolean) => ({
      buffer: targetBuffer,
      format,
      length,
      size,
      volatile,
      version: 0,
      readWrite,
    }) as StorageSource;

    const sources = history ? seq(history).map(() => makeSource(false)) : undefined;

    const source = makeSource(true) as any as StorageTarget;
    source.swap = swap;
    source.history = sources;

    swap();

    return source;
  }, [targetBuffer, width, height, depth, format, history]);

  if (!(render ?? children)) return yeet(source);

  const content = render ? render(source) : children;
  const view = provide(ComputeContext, source, content);

  if (then) return fence(view, () => then(source));
  return view;
}
