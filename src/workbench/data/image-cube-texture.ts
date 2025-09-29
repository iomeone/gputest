import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { Point, ColorSpace, TextureSource } from '@use-gpu/core';

import { useDeviceContext } from '../providers/device-provider';
import { use, yeet, gather, memo, useMemo, useYolo } from '@use-gpu/live';
import { makeDynamicTexture, uploadExternalTexture, updateMipArrayTextureChain } from '@use-gpu/core';
import { Fetch } from './fetch';

export type ImageCubeTextureProps = {
  /** URLs to 6 images (+x, -x, +y, -y, +z, -z) */
  urls: string[],
  /** Color space to tag texture as. Does not convert input data. */
  colorSpace?: ColorSpace,
  /** MIPs */
  mip?: number | boolean,
  /** Texture sampler */
  sampler?: GPUSamplerDescriptor,
  /** Leave empty to yeet texture instead. */
  render?: (source: TextureSource) => LiveElement,
};

const countMips = (width: number, height: number): number => {
  const max = Math.max(width, height);
  return Math.floor(Math.log2(max));
}

export const ImageCubeTexture: LiveComponent<ImageCubeTextureProps> = (props) => {
  const device = useDeviceContext();

  const {
    urls,
    sampler,
    mip = true,
    colorSpace = 'srgb',
    render,
  } = props;

  const fetch = urls.map((url: string) =>
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

  return gather(fetch, (bitmaps: ImageBitmap[]) => {
    if (bitmaps.filter(x => !!x).length !== 6) return null;

    const source = useMemo(() => {
      const [{width, height}] = bitmaps;
      const size = [width, height] as Point;

      let format: GPUTextureFormat = 'rgba8unorm';
      let cs = colorSpace;
      if (colorSpace === 'srgb') {
        format = 'rgba8unorm-srgb';
        cs = 'linear';
      }

      const mips = (
        typeof mip === 'number' ? mip :
        mip ? countMips(width, height) : 1
      );

      const texture = makeDynamicTexture(device, width, height, 6, format, 1, mips);
      bitmaps.forEach((bitmap: ImageBitmap, i: number) =>
        uploadExternalTexture(device, texture, bitmap, size, [0, 0, i]));

      const source = {
        texture,
        view: texture.createView({
          dimension: 'cube',
        }),
        sampler: {
          minFilter: 'linear',
          magFilter: 'linear',
          mipmapFilter: 'linear',
          maxAnisotropy: 4,
          ...sampler,
        } as GPUSamplerDescriptor,
        layout: 'texture_cube<f32>',
        mips,
        format,
        size: [width, height, 6],
        colorSpace: cs,
        version: 1,
      } as TextureSource;

      updateMipArrayTextureChain(device, source);

      return source;
    }, [bitmaps, sampler]);

    return useYolo(() => render ? (source ? render(source) : null) : yeet(source), [render, source]);
  });
};
