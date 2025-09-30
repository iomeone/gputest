import type { LiveComponent } from '../../live';
import type { Rectangle } from '../../core';

import { memo, yeet } from '../../live';

import { useFontFamily, useFontText, useFontHeight } from './providers/font-provider';
import { useSDFGlyphData } from './providers/sdf-font-provider';
import { SDFGlyphData, Alignment } from './types';

export type GlyphSourceProps = {
  family?: string,
  weight?: string | number,
  style?: string,

  strings: string[] | string,
  lineHeight?: number,
  align?: Alignment,
  wrap?: number,
  hint?: 'x' | 'y' | 'xy' | false,
  size?: number,
  monochrome?: boolean,

  render?: (data: SDFGlyphData) => void,
};

const NO_LAYOUT: Rectangle = [0, 0, 0, 0];

export const GlyphSource: LiveComponent<GlyphSourceProps> = memo((props: GlyphSourceProps) => {
  const {
    family,
    weight,
    style,

    strings,
    lineHeight,
    align = 'center',
    size = 48,
    wrap = 0,
    monochrome = false,
    hint,

    render,
  } = props;

  const font = useFontFamily(family, weight, style);
  const {spans, breaks, glyphs} = useFontText(font, strings, size);
  const height = useFontHeight(font, size, lineHeight);

  const data = useSDFGlyphData(
    NO_LAYOUT,
    font,
    spans,
    glyphs,
    breaks,
    height,
    align,
    size,
    wrap,
    hint,
    monochrome,
  );

  return render ? render(data) : yeet(data);
}, 'GlyphSource');
