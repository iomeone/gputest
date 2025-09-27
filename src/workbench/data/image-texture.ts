import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { Point, ColorSpace, TextureSource } from '@use-gpu/core';

import { DeviceContext } from '../providers/device-provider';
import { use, yeet, gather, memo, useOne, useMemo, useContext } from '@use-gpu/live';
import { makeCopyableTexture, makeTextureView, uploadExternalTexture } from '@use-gpu/core';
import { Fetch } from './fetch';

export type ImageTextureProps = {
  url?: string,
  colorSpace?: ColorSpace,
  sampler?: GPUSamplerDescriptor,
  render?: (source: TextureSource) => LiveElement<any>,
};

export const ImageTexture: LiveComponent<ImageTextureProps> = (props) => {
  const device = useContext(DeviceContext);

  const {
    url,
    sampler,
    colorSpace = 'srgb',
    render,
  } = props;

  const fetch = (
    use(Fetch, {
      url,
      type: 'blob',
      loading: null,
      then: (blob: Blob | null) => {
        if (blob == null) return null;

        return createImageBitmap(blob, {
          premultiplyAlpha: 'default',
          colorSpaceConversion: 'none',
        });
      },
    })
  );

  return gather(fetch, ([bitmap]: ImageBitmap[]) => {
    const source = useOne(() => {
      const size = [bitmap.width, bitmap.height] as Point;
      const format = 'rgba8unorm';

      const texture = makeCopyableTexture(device, bitmap.width, bitmap.height, format);
      uploadExternalTexture(device, texture, bitmap, size);

      return {
        texture,
        view: makeTextureView(texture),
        sampler: {
          minFilter: 'nearest',
          magFilter: 'nearest',
          ...sampler,
        } as GPUSamplerDescriptor,
        layout: 'texture_2d<f32>',
        format,
        size,
        colorSpace,
        version: 1,
      };
    }, [bitmap, sampler]);

    return useMemo(() => source ? (render ? render(source) : yeet(source)) : null, [render, source]);
  });
};
