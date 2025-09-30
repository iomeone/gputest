import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { RustTextAPI, Font } from '@use-gpu/glyph';

import { parseWeight } from '@use-gpu/parse';
import { provide, makeContext, useContext, useMemo, useOne, useResource } from '@use-gpu/live';
import { makeTuples } from '@use-gpu/core';
import { RustText, packStrings } from '@use-gpu/glyph';
import { useForceUpdate } from '../../hooks/useForceUpdate';

export const FontContext = makeContext<RustTextAPI>(undefined, 'FontContext');
export const useFontContext = () => useContext(FontContext);

export type FontProviderProps = {
  fonts: Font[],
  children?: LiveElement,
};

export const FontProvider: LiveComponent<FontProviderProps> = ({fonts, children}) => {
  const rustText = useOne(RustText);

  const context = useMemo(() => {
    if (!rustText) return null;

    if (fonts) rustText.setFonts(fonts);
    return {...rustText};
  }, [rustText, fonts]);

  return context && children ? provide(FontContext, context, children) : null;
};

// Measure and parse packed text chunks
export const useFontFamily = (
  family?: string,
  weight?: string | number,
  style?: string,
) => {
  const rustText = useFontContext();

  return useMemo(() => {
    const families = family != null ? family.split(/\s*,\s*/g).filter(s => s !== '') : [undefined];
    const w = parseWeight(weight);
    return rustText.resolveFontStack(families.map(family => ({family, weight: w, style})));
  }, [family, weight, style, rustText]);
}

// Measure and parse packed text chunks
export const useFontText = (
  stack: number[],
  strings: string[] | string,
  size: number,
) => {
  const rustText = useFontContext();

  const [version, forceUpdate] = useForceUpdate();
  const packed = useOne(() => packStrings(strings), strings);

  return useMemo(() => {
    const {breaks, metrics: m, glyphs: g, missing: i} = rustText.measureSpans(stack, packed, size);
    const spans = makeTuples(m, 3);
    const glyphs = makeTuples(g, 4);
    const missing = makeTuples(i, 2);

    missing.iterate((index: number, glyph: number) =>
      rustText.loadMissingGlyph(stack[index], glyph, forceUpdate)
    );

    return {spans, glyphs, breaks};
  }, [packed, size, rustText, version]);
}

// Get font metrics
export const useFontHeight = (
  stack: number[],
  size: number,
  lineHeight?: number,
) => {
  const rustText = useFontContext();
  const [id] = stack;

  return useMemo(() => {
    // eslint-disable-next-line prefer-const
    let {ascent, descent, lineHeight: fontHeight, xHeight, emUnit} = rustText.measureFont(id, size);

    const lh = lineHeight ?? fontHeight;
    const xh = xHeight * lh / fontHeight;
    const pad = (lh - fontHeight) / 2;
    ascent += pad;
    descent -= pad;

    return {ascent, descent, lineHeight: lh, xHeight: xh, emUnit};
  }, [id, size, lineHeight, rustText]);
}

export const useFontDebug = () => {
  const [, forceUpdate] = useForceUpdate();
  const rustText = useFontContext();

  useResource((dispose) => {
    dispose(rustText.debugListener(forceUpdate));
  }, []);
};
