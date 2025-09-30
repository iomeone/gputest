import type { LiveElement, LC, PropsWithChildren } from '@use-gpu/live';
import type { TypedArray, StorageSource, Emit } from '@use-gpu/core';
import type { ShaderModule } from '@use-gpu/shader';

import { useDeviceContext } from '../providers/device-provider';
import { QueueReconciler } from '../reconcilers/index';

import { useMemo, useNoMemo, useOne } from '@use-gpu/live';
import { bundleToAttribute } from '@use-gpu/shader/wgsl';
import { incrementVersion } from '@use-gpu/live';
import { makeUniformLayout, makeLayoutFiller, makeLayoutData, makeStorageBuffer, uploadBuffer } from '@use-gpu/core';
import { useTimeContext, useNoTimeContext } from '../providers/time-provider';
import { useAnimationFrame, useNoAnimationFrame } from '../providers/loop-provider';
import { useBufferedSize } from '../hooks/useBufferedSize';

import { useRenderProp } from '../hooks/useRenderProp';

const {signal} = QueueReconciler;

export type StructDataProps = PropsWithChildren<{
  /** Set/override input length */
  length?: number,

  /** Struct WGSL type */
  format?: 'T' | 'array<T>',
  type?: ShaderModule,

  /** Input data */
  data?: Record<string, number | number[] | TypedArray>[],
  /** Input emitter expression */
  expr?: (emit: Emit, ...args: any[]) => void,
  /** Emit 0 or 1 item per `expr` call. */
  sparse?: boolean,
  /** Add current `TimeContext` to the `expr` arguments. */
  time?: boolean,
  /** Resample `data` or `expr` on every animation frame. */
  live?: boolean,

  /** Leave empty to yeet source instead. */
  render?: (source: StorageSource) => LiveElement,
  children?: (source: StorageSource) => LiveElement,
}>;

export const StructData: LC<StructDataProps> = (props: StructDataProps) => {
  const {
    length,
    data,

    sparse,
    expr,
    time,

    format = 'array<T>',
    type,
    live,
  } = props;

  if (!type || typeof type === 'string') throw new Error("<StructData> type must be a WGSL shader type");

  // Make struct uniform layout
  const layout = useOne(() => {
    const bindings = bundleToAttribute(type);
    if (!Array.isArray(bindings.format)) throw new Error(`<StructData> type '${bindings.name}' is not a struct type`);

    const layout = makeUniformLayout(bindings.format);
    return layout;
  }, type);

  // Get size
  const count = (length ?? (data?.length || 0));
  const l = useBufferedSize(count);

  const device = useDeviceContext();

  // Make storage buffer
  const [source, array] = useMemo(() => {
    const array = makeLayoutData(layout, l);
    const buffer = makeStorageBuffer(device, array);

    const source = {
      buffer,
      format,
      type,
      length: 0,
      size: [0],
      version: 1,
    } as any as StorageSource;

    return [source, array];
  }, [device, layout, l]);

  // Prepare to fill layout
  const filler = useMemo(() => makeLayoutFiller(layout, array), [layout, array]);

  // Provide time for expr
  const clock = time && expr ? useTimeContext() : useNoTimeContext();

  // Refresh and upload data
  const refresh = () => {
    let emitted = 0;

    if (data) {
      filler.fill(data);
    }
    if (expr) {
      let field = 0;
      const emit = (...args: any[]) => filler.setValue(emitted, field++, args);
      for (let i = 0; i < count; ++i) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        expr(emit, i, count, clock!);

        if (field) {
          emitted++;
          field = 0;
        }
      }
    }
    if (data || expr) {
      uploadBuffer(device, source.buffer, array);
      source.version = incrementVersion(source.version);
    }

    source.length  = !sparse ? count : emitted;
    source.size    = [source.length]
  };

  if (!live) {
    useNoAnimationFrame();
    useMemo(refresh, [device, source, array, data, expr, count]);
  }
  else {
    useAnimationFrame();
    useNoMemo();
    refresh();
  }

  const trigger = useOne(() => signal(), source.version);
  const view = useRenderProp(props, source);
  return [trigger, view];
};
