import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { DataTexture, TextureSource } from '@use-gpu/core';

import { DeviceContext } from '../providers/device-provider';
import { useAnimationFrame, useNoAnimationFrame } from '../providers/loop-provider';
import { QueueReconciler } from '../reconcilers/index';
import { yeet, useOne, useMemo, useNoMemo, useContext, useHooks, incrementVersion } from '@use-gpu/live';
import { makeRawTexture, uploadDataTexture, updateMipTextureChain, updateMipArrayTextureChain } from '@use-gpu/core';

const {signal} = QueueReconciler;

export type RawTextureProps = {
  /** Texture data */
  data: DataTexture,
  /** MIPs */
  mip?: number | boolean,
  /** Texture sampler */
  sampler?: GPUSamplerDescriptor,
  /** Resample data every animation frame */
  live?: boolean,

  /** Sample in absolute pixels instead of relative UVs */
  absolute?: boolean,
  /** Convert RGBA to premultiplied alpha before upload */
  premultiply?: boolean,

  /** Leave empty to yeet source(s) instead. */
  render?: (source: TextureSource) => LiveElement,
};

const countMips = (width: number, height: number): number => {
  const max = Math.max(width, height);
  return Math.floor(Math.log2(max));
}

/** Use numeric texture data as a 2D texture. */
export const RawTexture: LiveComponent<RawTextureProps> = (props) => {
  const device = useContext(DeviceContext);

  const {
    data,
    sampler,
    render,
    premultiply = false,
    mip = false,
    absolute = false,
    live = false,
  } = props;

  const memoKey = data ? [data.format, ...data.size].join('/') : null;

  // Make source texture from data
  const source = useMemo(() => {
    const {
      size,
      layout = 'texture_2d<f32>',
      format = 'rgba8unorm',
      colorSpace = 'native',
    } = data;

    const mips = (
      typeof mip === 'number' ? mip :
      mip ? countMips(size[0], size[1]) : 1
    );

    const texture = makeRawTexture(device, data, mips);
    const source = {
      texture,
      sampler: {
        minFilter: 'nearest',
        magFilter: 'nearest',
        ...sampler,
      } as GPUSamplerDescriptor,
      mips,
      size,
      layout,
      format,
      colorSpace,
      absolute,
      version: 0,
    };
    return source;
  }, [device, memoKey, sampler, absolute, mip]);

  // Refresh and upload data
  const refresh = () => {
    if (!source || !data) return;

    const {size, data: upload} = data;
    if (premultiply) {
      const pre = upload.slice();
      for (let i = 0, j = 0, n = size[0] * size[1]; i < n; ++i, j += 4) {
        const a = pre[j + 3] / 255;
        pre[j    ] = pre[j    ] * a;
        pre[j + 1] = pre[j + 1] * a;
        pre[j + 2] = pre[j + 2] * a;
      }
      uploadDataTexture(device, source.texture, {...data, data: pre});
    }
    else {
      uploadDataTexture(device, source.texture, data);
    }
    source.version = incrementVersion(source.version);

    if (source.mips > 1) {
      if (source.layout.match(/array/)) updateMipArrayTextureChain(device, source);
      else updateMipTextureChain(device, source);
    }
  };

  if (!live) {
    useNoAnimationFrame();
    useMemo(refresh, [device, source, data, premultiply]);
  }
  else {
    useAnimationFrame();
    useNoMemo();
    refresh();
  }

  const trigger = useOne(() => signal(), source.version);
  const view = useHooks(() => render ? render(source) : yeet(source), [render, source]);
  return [trigger, view];
};
