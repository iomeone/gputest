import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { ColorSpace, DataTexture } from '@use-gpu/core';

import { use, useCallback } from '@use-gpu/live';
import { patch } from '@use-gpu/state';
import { Fetch } from './fetch';

import { parseHDR } from '../codec/hdr';
import { parseRGBM16 } from '../codec/rgbm16';

const MIME_TYPES = {
  'png': 'image/png',
  'jpg': 'image/jpeg',
  'hdr': 'image/vnd.radiance',
} as Record<string, string>;

type LoadedImage = {
  bitmap?: ImageBitmap,
  data?: DataTexture,
  format: GPUTextureFormat,
  colorSpace: ColorSpace,
}

export type ImageLoaderProps = {
  /** URL For image */
  url: string,
  /** Type hint (extension or mime type) */
  format?: string,
  /** Color space */
  colorSpace?: ColorSpace,
  /** Premultiply alpha */
  premultiply?: boolean,
  /** Leave empty to yeet image instead. */
  render?: (image: LoadedImage) => LiveElement,
  children?: (image: LoadedImage) => LiveElement,
};

export const ImageLoader: LiveComponent<ImageLoaderProps> = (props) => {

  const {
    url,
    format = 'rgba8unorm',
    colorSpace = 'srgb',
    premultiply,
    render,
    children,
  } = props;

  const then = useCallback(async (response: Response) => {
    if (!response) return null;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const mime = response.headers.get('content-type') ?? MIME_TYPES[format!] ?? 'bin';

    const resolveFormat = (format: GPUTextureFormat) => {
      let cs = colorSpace;

      // eslint-disable-next-line no-debugger
      if (!format.match) debugger;
      if (colorSpace === 'srgb' && format?.match(/^(rgba|bgra)8unorm$/)) {
        format += '-srgb';
        cs = 'linear';
      }

      return {format, colorSpace: cs};
    };

    if (format === 'hdr' || mime === 'image/vnd.radiance') {
      const arrayBuffer = await response.arrayBuffer();
      try {
        const parsed = parseHDR(arrayBuffer);
        const {format, colorSpace} = resolveFormat(parsed.format);
        return patch({data: parsed}, {data: {format}, format, colorSpace});
      } catch (e) { console.error(e); }
    }
    else if (format === 'rgbm16') {
      const arrayBuffer = await response.arrayBuffer();

      // @ts-ignore
      const decoder = new ImageDecoder({
        data: arrayBuffer,
        type: mime,
        premultiplyAlpha: premultiply ? 'premultiply' : 'none',
        colorSpaceConversion: 'none',
      });

      const {image} = await decoder.decode({ frameIndex: 0 });
      const {codedWidth: w, codedHeight: h} = image;

      const buffer = new Uint8Array(image.allocationSize());
      image.copyTo(buffer);

      let decoded: GPUTextureFormat = 'rgba8unorm';
      if (image.format.slice(0, 3) === 'BGR') decoded = 'bgra8unorm';

      const flip = !!decoded.match(/^bgr/);
      const out = parseRGBM16(buffer, w, h, flip);

      return {
        data: {
          data: out,
          size: [w, h],
          format: 'rgba16float',
        },
        format: 'rgba16float',
        colorSpace: 'linear',
      };
    }
    else {
      const blob = await response.blob();
      const {format: f, colorSpace} = resolveFormat('rgba8unorm');
      return {
        format: f,
        colorSpace,
        bitmap: await createImageBitmap(blob, {
          premultiplyAlpha: premultiply ? 'premultiply' : 'none',
          colorSpaceConversion: 'none',
        }),
      };
    }
  }, [url, format, colorSpace, premultiply]);

  return use(Fetch, {
    url,
    loading: null,
    render,
    children,
    then,
  });
};
