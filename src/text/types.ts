export type FontMetrics = {
  ascent: number,
  descent: number,
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
};

export type PerSpan => (hard: bool, advance: number, trim: number) => void;
export type PerGlyph => (id: number, isWhiteSpace: boolean) => void;

export type SpanData = {
  forSpans: (callback: PerSpan, startIndex?: number, endIndex?: number) => void,
  forGlyphs: (callback: PerGlyph, startIndex?: number, endIndex?: number) => void,
  getStart: (i: number) => number,
  getEnd: (i: number) => number,
};

export type GPUTextContext = {
  measureFont: (size: number) => FontMetrics,
  measureSpans: (text: string, size: number) => SpanMetrics,
  measureGlyph: (id: number, size: number) => GlyphMetrics,
};

