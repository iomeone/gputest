import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { TypedArray, DataTexture, TextureSource } from '@use-gpu/core';

import { DeviceContext } from '../providers/device-provider';
import { usePerFrame, useNoPerFrame } from '../providers/frame-provider';
import { useAnimationFrame, useNoAnimationFrame } from '../providers/loop-provider';
import { yeet, memo, useMemo, useNoMemo, useContext, useNoContext, incrementVersion } from '@use-gpu/live';
import { makeSampler, makeRawTexture, makeTextureView, uploadDataTexture } from '@use-gpu/core';

export type RawTextureProps = {
  data?: DataTexture,
  sampler?: GPUSamplerDescriptor,
  live?: boolean,

  render?: (source: TextureSource) => LiveElement<any>,
};

export const RawTexture: LiveComponent<RawTextureProps> = (props) => {
  const device = useContext(DeviceContext);

  const {
    data,
    sampler,
    render,
    live = false,
  } = props;

  const memoKey = data ? [data.format, ...data.size].join('/') : null;

  // Make source texture from data
  const source = useMemo(() => {
    if (!data) return null;

    const {
      size,
      layout = 'texture_2d<f32>',
      format = 'rgba8unorm',
      colorSpace = 'native',
    } = data;
    const texture = makeRawTexture(device, data);
    const source = {
      texture,
      view: makeTextureView(texture),
      sampler: {
        minFilter: 'nearest',
        magFilter: 'nearest',
        ...sampler,
      } as GPUSamplerDescriptor,
      size,
      layout,
      format,
      colorSpace,
      version: 0,
    };
    return source;
  }, [device, memoKey, sampler]);

  // Refresh and upload data
  const refresh = () => {
    if (!source || !data) return;

    uploadDataTexture(device, source.texture, data);
    source.version = incrementVersion(source.version);
  };

  if (!live) {
    useNoPerFrame();
    useNoAnimationFrame();
    useMemo(refresh, [device, source, data]);
  }
  else {
    usePerFrame();
    useAnimationFrame();
    useNoMemo();
    refresh();
  }

  return useMemo(() => source ? (render ? render(source) : yeet(source)) : null, [render, source]);
};
