import type { LiveComponent, LiveElement } from '../../live';
import type { ColorSpace, DataTexture } from '../../core';

import { use, useCallback } from '../../live';
import { patch } from '../../state';
import { Fetch, FetchAPIOptions } from './fetch';

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
  url?: string,
  /** fetch() API options */
  options?: FetchAPIOptions,

  /** Type hint (extension or mime type) */
  format?: string,
  /** Pixel format override for texture */
  pixelFormat?: GPUTextureFormat,
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
    options,

    format,
    pixelFormat,
    colorSpace = 'srgb',
    premultiply,
    render,
    children,
  } = props;

  const then = useCallback(async (response: Response) => {
    if (!response) return null;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const mime = response.headers.get('content-type') ?? MIME_TYPES[format!] ?? 'bin';

    const getRawImage = async (arrayBuffer: ArrayBuffer) => {
      // @ts-ignore
      const decoder = new ImageDecoder({
        data: arrayBuffer,
        type: mime,
        premultiplyAlpha: premultiply ? 'premultiply' : 'none', // not part of official types yet
        colorSpaceConversion: 'none',
      } as any); // todo: remove any

      const {image} = await decoder.decode({ frameIndex: 0 });
      const {codedWidth: width, codedHeight: height} = image;

      const buffer = new Uint8Array(image.allocationSize());
      image.copyTo(buffer);

      return {image, buffer, width, height};
    };

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
      const {image, buffer, width, height} = await getRawImage(arrayBuffer);

      let decoded: GPUTextureFormat = 'rgba8unorm';
      if (image.format?.slice(0, 3) === 'BGR') decoded = 'bgra8unorm';

      const flip = !!decoded.match(/^bgr/);
      const out = parseRGBM16(buffer, width, height, flip);

      return {
        data: {
          data: out,
          size: [width, height],
          format: 'rgba16float',
        },
        format: 'rgba16float',
        colorSpace: 'linear',
      };
    }
    else {
      const {format: f, colorSpace} = resolveFormat(pixelFormat ?? 'rgba8unorm');

      if (f.match(/unorm(-srgb)?$/)) {
        const blob = await response.blob();
        return {
          format: f,
          colorSpace,
          bitmap: await createImageBitmap(blob, {
            premultiplyAlpha: premultiply ? 'premultiply' : 'none',
            colorSpaceConversion: 'none',
          }),
        };
      }
      else if (f.match(/u?int(-srgb)?$/)) {
        // Can't upload as native texture, copy f32 -> u32 fails
        const arrayBuffer = await response.arrayBuffer();
        const {buffer, width, height} = await getRawImage(arrayBuffer);
        return {
          format: f,
          colorSpace,
          data: {
            data: buffer,
            format: f,
            size: [width, height],
          },
        };
      }
      else {
        throw new Error(`Unsupported image format '${format}' -> '${f}'`);
      }
    }
  }, [format, pixelFormat, colorSpace, premultiply]);

  return use(Fetch, {
    url,
    options,

    loading: null,
    render,
    children,
    then,
  });
};
