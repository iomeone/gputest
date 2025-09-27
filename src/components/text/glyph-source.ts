import { LiveComponent } from '../../live/types';
import { Rectangle, StorageSource } from '../../core/types';
import { Alignment } from '../layout/types';

import { memo, yeet, useContext, useOne } from '../../live';
import { makeTuples } from '../../core';

import { useFontFamily, useFontText, useFontHeight } from './providers/font-provider';
import { useSDFGlyphData } from './providers/sdf-font-provider';

type GlyphSourceProps = {
  family?: string,
  weight?: string | number,
  style?: string,

  strings: string[] | string,
  lineHeight?: number,
  align?: Alignment,
  wrap?: number,
  snap?: boolean,
  size?: number,
  
  render?: (buffers: StorageSource[]) => void,
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
    snap,
    
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
    snap,
  );
  
  return render ? render(data) : yeet(data);
});

GlyphSource.displayName = 'GlyphSource';