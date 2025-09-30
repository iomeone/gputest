import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { XY, ColorSpace, TextureSource } from '@use-gpu/core';

import { use, yeet, gather, suspend, useMemo } from '@use-gpu/live';
import { makeDynamicTexture, uploadDataTexture, uploadExternalTexture, updateMipTextureChain } from '@use-gpu/core';
import { ImageLoader } from './image-loader';

import { useDeviceContext } from '../providers/device-provider';
import { useSuspenseContext } from '../providers/suspense-provider';
import { useRenderProp, getRenderFunc } from '../hooks/useRenderProp';

export type ImageTextureProps = {
  /** URL to image */
  url: string,
  /** Type hint */
  format?: string,
  /** Color space to tag texture as. Does not convert input data. */
  colorSpace?: ColorSpace,
  /** MIPs */
  mip?: number | boolean,
  /** Texture sampler */
  sampler?: GPUSamplerDescriptor,
  /** Leave empty to yeet texture instead. */
  render?: (source: TextureSource | null) => LiveElement,
  children?: (source: TextureSource | null) => LiveElement,
};

const countMips = (width: number, height: number): number => {
  const max = Math.max(width, height);
  return Math.floor(Math.log2(max));
}

export const ImageTexture: LiveComponent<ImageTextureProps> = (props) => {
  const device = useDeviceContext();

  const {
    url,
    sampler,
    format,
    colorSpace = 'srgb',
    mip = true,
  } = props;

  const suspense = useSuspenseContext();
  const fetch = use(ImageLoader, {url, format, colorSpace});

  return gather(fetch, ([resource]: any[]) => {
    const render = getRenderFunc(props);
    if (!resource) return suspense ? suspend() : render ? render(null) : yeet(null);

    const source = useMemo(() => {
      const {format, colorSpace} = resource;

      let size: XY = [0, 0];
      if ('bitmap' in resource) size = [resource.bitmap.width, resource.bitmap.height];
      else if ('data' in resource) size = resource.data.size;

      const [width, height] = size;
      const mips = (
        typeof mip === 'number' ? mip :
        mip ? countMips(width, height) : 1
      );

      const texture = makeDynamicTexture(device, width, height, 1, format, 1, mips);
      if ('bitmap' in resource) uploadExternalTexture(device, texture, resource.bitmap, [width, height], [0, 0]);
      if ('data' in resource) uploadDataTexture(device, texture, resource.data, [width, height], [0, 0]);

      const source = {
        texture,
        view: texture.createView(),
        sampler: {
          minFilter: 'linear',
          magFilter: 'linear',
          mipmapFilter: 'linear',
          maxAnisotropy: 4,
          ...sampler,
        } as GPUSamplerDescriptor,
        layout: 'texture_2d<f32>',
        mips,
        format,
        size,
        colorSpace,
        version: 1,
      };

      updateMipTextureChain(device, source);

      return source;
    }, [resource, sampler]);

    return useRenderProp(props, source);
  });
};
