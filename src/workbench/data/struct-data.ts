import type { LiveElement, LC, PropsWithChildren } from '@use-gpu/live';
import type { TypedArray, StorageSource, Emit, Time } from '@use-gpu/core';
import type { ShaderModule, ShaderSource } from '@use-gpu/shader';

import { useDeviceContext } from '../providers/device-provider';

import { yeet, useMemo, useNoMemo, useOne } from '@use-gpu/live';
import { bundleToAttribute } from '@use-gpu/shader/wgsl';
import { incrementVersion } from '@use-gpu/live';
import { makeUniformLayout, makeLayoutFiller, makeLayoutData, makeStorageBuffer, uploadBuffer } from '@use-gpu/core';
import { useTimeContext, useNoTimeContext } from '../providers/time-provider';
import { usePerFrame, useNoPerFrame } from '../providers/frame-provider';
import { useAnimationFrame, useNoAnimationFrame } from '../providers/loop-provider';
import { useBufferedSize } from '../hooks/useBufferedSize';

export type StructDataProps = {
  length?: number,
  data?: any[],

  sparse?: boolean,
  expr?: (emit: Emit, i: number, n: number, t?: Time) => void,

  format: ShaderModule,
  live?: boolean,

  render?: (...source: ShaderSource[]) => LiveElement<any>,
  children?: LiveElement<any>,
};

export const StructData: LC<StructDataProps> = (props: PropsWithChildren<StructDataProps>) => {
  const {
    length,
    data,
    
    sparse,
    expr,
    
    format,
    live,

    render,
  } = props;

  if (!format || typeof (format as any) === 'string') throw new Error("<StructData> format must be a shader module");

  // Make struct uniform layout
  const [bindings, layout] = useOne(() => {
    const bindings = bundleToAttribute(format);
    if (!bindings.members) throw new Error("<StructData> format is not a shader struct");

    const layout = makeUniformLayout(bindings.members);
    return [bindings, layout];
  }, format);
  
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
      length: 0,
      size: [0],
      version: 1,
    } as any as StorageSource;

    return [source, array];
  }, [device, layout, l]);

  // Prepare to fill layout
  const filler = useMemo(() => makeLayoutFiller(layout, array), [layout, array]);

  // Provide time for expr
  const time = expr ? useTimeContext() : useNoTimeContext();

  // Refresh and upload data
  const refresh = () => {
    let emitted = 0;

    if (data) filler.fill(data);
    if (expr) {
      let field = 0;
      const emit = (...args: any[]) => filler.setValue(emitted, field++, args);
      for (let i = 0; i < count; ++i) {
        expr(emit, i, count, time!);

        if (field) {
          emitted++;
          field = 0;
        }
      }
    }
    if (data || expr) {
      uploadBuffer(device, source.buffer, array);
    }

    source.length  = !sparse ? count : emitted;
    source.size    = [source.length]
    source.version = incrementVersion(source.version);
  };

  if (!live) {
    useNoPerFrame();
    useNoAnimationFrame();
    useMemo(refresh, [device, source, array, data, expr, count]);
  }
  else {
    usePerFrame();
    useAnimationFrame();
    useNoMemo();
    refresh();
  }

  return useMemo(() => render ? render(source) : yeet(source), [render, source]);
};
