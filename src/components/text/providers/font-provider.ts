import { LiveComponent } from '@use-gpu/live/types';
import { RustTextAPI } from '@use-gpu/text/types';
import { Font } from '../types';

import { provide, useAsync, makeContext, useContext, useMemo, useOne } from '@use-gpu/live';
import { parseWeight } from '../../plot/util/parse';
import { makeTuples } from '@use-gpu/core';
import { RustText, packStrings } from '@use-gpu/text';

export type FontContextProps = {
  gpuText: RustTextAPI,
};

export const FontContext = makeContext<FontContextProps>(undefined, 'FontContext');
export const useFontContext = () => useContext(FontContext);

export type FontProviderProps = {
  fonts: Font[],
  children: LiveElement<any>,
};

export const FontProvider: LiveComponent<FontProviderProps> = ({fonts, children}) => {
  const [rustText] = useAsync(RustText);

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

  const packed = useMemo(() => packStrings(strings), strings);

  return useMemo(() => {
    const {breaks, metrics: m, glyphs: g} = rustText.measureSpans(stack, packed, size);
    const spans = makeTuples(m, 3);
    const glyphs = makeTuples(g, 3);
    return {spans, glyphs, breaks};
  }, [packed, size, rustText]);
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
    const {ascent, descent, lineHeight: fontHeight} = rustText.measureFont(id, size);

    const lh = lineHeight ?? fontHeight;
    const baseline = ascent + (lh - fontHeight) / 2;

    return {ascent, descent, baseline, lineHeight: lh};
  }, [id, size, lineHeight, rustText]);
}
