import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { XY, ColorSpace, TextureSource } from '@use-gpu/core';

import { yeet, gather, keyed, wrap, suspend, useMemo } from '@use-gpu/live';
import { Suspense } from '@use-gpu/workbench';
import { makeDynamicTexture, uploadDataTexture, uploadExternalTexture, updateMipArrayTextureChain } from '@use-gpu/core';

import { useDeviceContext } from '../providers/device-provider';
import { useSuspenseContext } from '../providers/suspense-provider';
import { useRenderProp, getRenderFunc } from '../hooks/useRenderProp';

import { ImageLoader } from './image-loader';

export type ImageCubeTextureProps = {
  /** URLs to 6 images (+x, -x, +y, -y, +z, -z) */
  urls: string[],
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

export const ImageCubeTexture: LiveComponent<ImageCubeTextureProps> = (props) => {
  const device = useDeviceContext();

  const {
    urls,
    sampler,
    format,
    colorSpace = 'srgb',
    mip = true,
  } = props;

  const suspense = useSuspenseContext();
  const fetch = useMemo(
    () => wrap(Suspense, urls.map((url: string) => keyed(ImageLoader, url, {url, format, colorSpace}))),
    [...urls, format, colorSpace]
  );

  return gather(fetch, (resources: any[]) => {
    const render = getRenderFunc(props);
    if (resources.filter(x => !!x).length !== 6) return suspense ? suspend() : render ? render(null) : yeet(null);

    const source = useMemo(() => {
      const [resource] = resources;
      const {format, colorSpace} = resource;

      let size: XY = [0, 0];
      if ('bitmap' in resource) size = [resource.bitmap.width, resource.bitmap.height];
      else if ('data' in resource) size = resource.data.size;

      const [width, height] = size;
      const mips = (
        typeof mip === 'number' ? mip :
        mip ? countMips(width, height) : 1
      );

      const texture = makeDynamicTexture(device, width, height, 6, format, 1, mips);
      resources.forEach((resource, i: number) => {
        if ('bitmap' in resource) uploadExternalTexture(device, texture, resource.bitmap, [width, height, 1], [0, 0, i]);
        if ('data' in resource) uploadDataTexture(device, texture, resource.data, [width, height, 1], [0, 0, i]);
      });

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
        colorSpace,
        version: 1,
      } as TextureSource;

      updateMipArrayTextureChain(device, source);

      return source;
    }, [resources, sampler]);

    return useRenderProp(props, source);
  });
};
