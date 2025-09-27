export type Font = {
  props: FontProps,
  buffer: ArrayBuffer,
};

export type FontProps = {
  family: string,
  weight: number,
  style: string,
};

export type FontMetrics = {
  ascent: number,
  descent: number,
  lineHeight: number,
  xHeight: number,
  emUnit: number,
};

export type SpanMetrics = {
  breaks: Uint32Array,
  metrics: Float32Array,
  glyphs: Int32Array,
};

export type GlyphMetrics = {
  id: number[],
  layoutBounds: [number, number, number, number],
  outlineBounds: [number, number, number, number] | null,
  image: Uint8Array,
  width: number,
  height: number,
  rgba: boolean,
  scale: number,
};

export type RustTextAPI = {
  resolveFont: (font: Partial<FontProps>) => number | null,
  resolveFontStack: (fonts: Partial<FontProps>[]) => number[],
  setFonts: (fonts: Font[]) => void,

  measureFont: (fontId: number, size: number) => FontMetrics,
  measureSpans: (fontStack: number[], text: Uint16Array, size: number) => SpanMetrics,
  measureGlyph: (fontId: number, glyphId: number, size: number) => GlyphMetrics,

  findGlyph: (fontId: number, char: string) => number;
};

export type Image = {
  data: Uint8Array,
  width: number,
  height: number,
  xo?: Float32Array | null,
  yo?: Float32Array | null,
  xi?: Float32Array | null,
  yi?: Float32Array | null,
};