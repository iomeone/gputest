import { LiveComponent } from '@use-gpu/live/types';
import { GPUTextContext } from '@use-gpu/text/types';

import { provideMemo, useAsync, useMemo, makeContext } from '@use-gpu/live';
import { GPUText } from '@use-gpu/text';
import { AtlasMapping, makeAtlas } from '@use-gpu/core';

export const FontContext = makeContext(null, 'FontContext');

export type FontContextProps = {
  gpuText: GPUTextContext,
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

const getNearestScale = (size: number) => roundUp2(size * 2);

const hashGlyph = (id: number, size: number) => (id << 16) + size;

type GlyphCache = {
  glyph: GlyphMetrics,
  mapping: Map<number, AtlasMapping>,
}

export const FontProvider: LiveComponent<FontProviderProps> = ({children}) => {

  const gpuText = useAsync(GPUText);
  const atlas = makeAtlas(1500, 1500);

  atlas.place(0, 100, 100);
  atlas.place(1, 110, 90);
  atlas.place(2, 75, 120);
  atlas.place(3, 50, 50);
  atlas.place(4, 150, 100);
  atlas.place(5, 250, 100);
  atlas.place(6, 350, 100);
  atlas.place(7, 600, 600);
  atlas.place(8, 140, 100);
  atlas.place(9, 450, 200);
  atlas.place(10, 140, 100);
  atlas.place(11, 140, 100);
  atlas.place(12, 250, 100);
  atlas.place(13, 80, 100);

  for (let i = 0; i < 30; ++i)
    atlas.place(15 + i, 95, 90);

    for (let i = 0; i < 50; ++i)
      atlas.place(50 + i, 85 + (i%4)*5, 85 + (i%3)*5);

  //for (let i = 100; i < 150; ++i) atlas.place(i, Math.random() * 50 + 100, Math.random() * 50 + 100);
  
  const context = useMemo(() => {
    const glyphs = new Map<number, GlyphCache>();

    const getScale = (size: number) => size / getNearestScale(size);

    const getGlyph = (id: number, size: number) => {
      return {};

      const key = hashGlyph(id, getNearestScale(size));
      const cache = glyphs.get(key);
      if (cache) return cache;

      const glyph = gpuText.measureGlyph(id, size);
      const mapping = atlas.place(glyph.width, glyph.height);
      const entry = {glyph, mapping};

      glyphs.set(key, entry);

      return glyph;
    };

    return {
      gpuText,
      atlas,
      getScale,
      getGlyph,
    };
  }, [gpuText]);

  return gpuText ? provideMemo(FontContext, context, children) : null;
};