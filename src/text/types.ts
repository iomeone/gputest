export type FontMetrics = {
  ascent: number,
  descent: number,
  baseline: number,
  lineHeight: number,
};

export type SpanMetrics = {
  breaks: number[],
  metrics: number[],
  glyphs: number[],
};

export type GlyphMetrics = {
  id: number[],
  layoutBounds: number[],
  outlineBounds: number[] | null,
  image: Uint8Array,
  bounds: number[],
  width: number,
  height: number,
};

export type RustTextAPI = {
  resolveFont: (font: Partial<Font>) => number,
  resolveFontStack: (fonts: Partial<Font>[]) => number[],
  setFonts: (fonts: Font[]) => void,

  measureFont: (fontId: number, size: number) => FontMetrics,
  measureSpans: (fontStack: number[], text: Uint16Array, size: number) => SpanMetrics,
  measureGlyph: (fontId: number, glyphId: number, size: number) => GlyphMetrics,

  packString: (s: string) => Uint16Array,
  packStrings: (s: string[]) => Uint16Array,
};

export const packStrings = (strings: string[] | string): Uint16Array => {
  let ss: string[];
  if (!Array.isArray(strings)) ss = [strings];
  else ss = strings;

  const c = ss.length;
  const n = ss.reduce((a, b) => a + b.length, 0);

  let pos = 0;
  const array = new Uint16Array(n + c);
  for (const s of ss) {
    const l = s.length;
    for (let i = 0; i < l; ++i) {
      const c = s.charCodeAt(i);
      if (c !== 0) {
        array[pos++] = c;
      }
    }
    array[pos++] = 0;
  }

  return array;
};

export const packString = packStrings;
