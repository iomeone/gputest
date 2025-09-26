import { LiveComponent } from '@use-gpu/live/types';
import { GPUTextContext } from '@use-gpu/text/types';

import { provideMemo, useAsync, useContext, useMemo, makeContext } from '@use-gpu/live';
import { GPUText, glyphToRGBA, glyphToSDF } from '@use-gpu/text';
import { AtlasMapping, makeAtlas, makeSourceTexture, makeTextureView, uploadAtlasMapping } from '@use-gpu/core';
import { DeviceContext } from '../providers/device-provider';

export const FontContext = makeContext(null, 'FontContext');

export type FontContextProps = {
  gpuText: GPUTextContext,
  getRadius: () => number,
  getGlyph: (i: number, s: number) => GlyphMetrics,
  getScale: (s: number) => number,
};

export type FontProviderProps = {
  children: LiveElement<any>,
};

const roundUp2 = (v: number) => {
  v--;
  v |= v >> 1;
  v |= v >> 2;
  v |= v >> 4;
  v |= v >> 8;
  v |= v >> 16;
  v++;
  return v;
};

const getNearestScale = (size: number) => roundUp2(size); 

const hashGlyph = (id: number, size: number) => (id << 16) + size;

type GlyphCache = {
  glyph: GlyphMetrics,
  mapping: Map<number, AtlasMapping>,
}

export const FontProvider: LiveComponent<FontProviderProps> = ({children}) => {

  const device = useContext(DeviceContext);
  const gpuText = useAsync(GPUText);
  
  const context = useMemo(() => {
    if (!gpuText) return null;

    const width = 1024;
    const height = 1024;
    const pad = 10;
    const radius = 10;
    const atlas = makeAtlas(width, height);

    const format = "rgba8unorm" as GPUTextureFormat;
    const texture = makeSourceTexture(device, atlas.width, atlas.height, 1, format);
    const source = {
      texture,
      view: makeTextureView(texture),
      sampler: {
        minFilter: 'linear',
        magFilter: 'linear',
      } as GPUSamplerDescriptor,
      layout: 'texture_2d<f32>',
      format,
      size: [width, height],
      version: 1,
    };

    const glyphs = new Map<number, GlyphCache>();

    const getRadius = () => radius;
    const getScale = (size: number) => size / getNearestScale(size);
    const getGlyph = (id: number, size: number): Entry => {
      const scale = getNearestScale(size);
      const key = hashGlyph(id, scale);
      const cache = glyphs.get(key);
      if (cache) return cache;

      const glyph = gpuText.measureGlyph(id, scale);
      let mapping: AtlasMapping | null = null;

      const {image, width: w, height: h, outlineBounds: ob} = glyph;
      if (image && w && h) {
        const {data, width, height} = glyphToSDF(image, w, h, pad, radius);

        ob[0] -= pad;
        ob[1] -= pad;
        ob[2] += pad;
        ob[3] += pad;

        mapping = atlas.place(id, width, height);
        uploadAtlasMapping(
          device,
          texture,
          format,
          data,
          mapping,
        );
      }

      const entry = {glyph, mapping};
      glyphs.set(key, entry);
      source.version++;

      return entry;
    };

    return {
      gpuText,
      atlas,
      texture,
      source,
      getRadius,
      getScale,
      getGlyph,
    };
  }, [gpuText]);

  return gpuText ? provideMemo(FontContext, context, children) : null;
};