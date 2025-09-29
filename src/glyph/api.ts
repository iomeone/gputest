import type { Font, FontProps, FontGlyph, FontMetrics, SpanMetrics, GlyphMetrics, RustTextAPI } from './types';
import { toMurmur53 } from '@use-gpu/state';
import { UseRustText } from '../pkg/use_gpu_text.js';

type ArrowFunction = (...args: any[]) => any;

const DEFAULT_FONTS = {
  "0": {
    props: {
      family: 'sans-serif',
      weight: 400,
      style: 'normal',
    },
  },
} as Record<string, Font>;

export const RustText = (): RustTextAPI => {

  const useRustText = UseRustText.new();

  const fontMap = new Map<number, Font>();
  const pendingGlyphs = new Map<number, ArrowFunction[]>;

  for (let k in DEFAULT_FONTS) fontMap.set(+k, DEFAULT_FONTS[k]);

  const setFonts = (fonts: Font[]) => {
    const keys = fonts.map(({props}) => toMurmur53(props));

    const remove = new Set<number>(fontMap.keys());
    remove.delete(0);

    keys.forEach((k, i) => {
      if (!fontMap.has(k)) {
        const font = fonts[i];

        if (font.buffer) useRustText.load_font(k, new Uint8Array(font.buffer));
        else if (font.lazy) useRustText.load_image_font(k, packStrings(font.lazy.sequences));

        fontMap.set(k, font);
      }
      else remove.delete(k);
    });

    for (const k of remove.keys()) {
      const font = fontMap.get(k)!;
      fontMap.delete(k);

      if (font.buffer) useRustText.unload_font(k);
      else if (font.lazy) useRustText.unload_image_font(k);
    }
  }

  const resolveFont = (font: Partial<FontProps>): number | null => {

    let best: number | null = null;
    let max = 0;

    const {
      family = '',
      weight = 400,
      style = 'normal',
    } = font;

    for (const k of fontMap.keys()) {
      const {props} = fontMap.get(k)!;
      const {family: f, style: s, weight: w} = props;

      let score = 0;
      if (f === family) score += 2;
      if (s === style) score += 1;
      score += Math.min(weight / w, w / weight);

      if (score > max) {
        max = score;
        best = k;
      }
    }

    return best;
  }

  const resolveFontStack = (fonts: Partial<FontProps>[]): number[] => {
    const stack = fonts.map(resolveFont).filter(x => x != null) as number[];
    return stack.length ? stack : [0];
  }

  const measureFont = (fontId: number, size: number): FontMetrics => {
    return useRustText.measure_font(fontId, size);
  }

  const measureSpans = (fontStack: number[], text: Uint16Array, size: number): SpanMetrics => {
    const s = useRustText.measure_spans(new Float64Array(fontStack), text, size);
    return {
      breaks: new Uint32Array(s.breaks.buffer),
      metrics: new Float32Array(s.metrics.buffer),
      glyphs: new Int32Array(s.glyphs.buffer),
      missing: new Int32Array(s.missing.buffer),
    };
  }

  const measureGlyph = (fontId: number, glyphId: number, size: number): GlyphMetrics => {
    return useRustText.measure_glyph(fontId, glyphId, size);
  }

  const loadMissingGlyph = (fontId: number, glyphId: number, callback: ArrowFunction) => {
    const {props, lazy} = fontMap.get(fontId)!;
    if (!lazy) return;

    const key = toMurmur53([fontId, glyphId]);

    let list = pendingGlyphs.get(key);
    if (list) {
      list.push(callback);
      return;
    }
    pendingGlyphs.set(key, list = [callback]);

    const resolve = (glyph: FontGlyph) => {
      const {type, buffer, width, height} = glyph;

      if (type === 'rgba') useRustText.load_image_rgba(fontId, glyphId, new Uint8Array(buffer), width || 1, height || 1);
      else if (type === 'png') useRustText.load_image_png(fontId, glyphId, new Uint8Array(buffer));
      else throw new Error(`Unknown glyph type '${type}' for '${JSON.stringify(props)}'`);

      const list = pendingGlyphs.get(key)!;
      pendingGlyphs.delete(key);
      for (const cb of list) cb();
    };

    const {sync, async, fetch: f} = lazy;
    if (sync) resolve(sync(glyphId));
    else if (async) async(glyphId).then(resolve);
    else if (f) fetch(f(glyphId)).then(r => {
      const mime = r.headers.get('content-type');
      if (mime === 'image/png') {
        r.arrayBuffer().then(buffer => resolve(({ type: 'png', buffer })))
      }
      else {
        console.warn(`Unsupported mime type '${mime}' for '${JSON.stringify(props)}'`);
      }
    })
    else throw new Error(`No loader defined for lazy font '${JSON.stringify(props)}'`);
  };

  const findGlyph = (fontId: number, char: string): [number, boolean] => {
    return useRustText.find_glyph(fontId, packString(char));
  };

  return {findGlyph, measureFont, measureSpans, measureGlyph, loadMissingGlyph, resolveFont, resolveFontStack, setFonts};
}

export const packStrings = (strings: string[] | string): Uint16Array => {
  if (!Array.isArray(strings)) return packString(strings);

  const ss: string[] = strings;
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

export const packString = (s: string): Uint16Array => {
  const n = s.length;

  let pos = 0;
  const array = new Uint16Array(n);
  for (let i = 0; i < n; ++i) {
    const c = s.charCodeAt(i);
    if (c !== 0) {
      array[pos++] = c;
    }
  }

  return array;
};
