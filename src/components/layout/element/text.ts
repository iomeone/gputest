import { LiveComponent, LiveElement } from '@use-gpu/live/types';
import { TextureSource, Emitter } from '@use-gpu/core/types';
import { SpanData, PerSpan, PerGlyph } from '@use-gpu/text/types';
import { Point4, InlineSpan } from './types';

import { keyed, yeet, useContext, useFiber, useOne, useMemo } from '@use-gpu/live';
import { makeTuples, emitIntoNumberArray } from '@use-gpu/core';
import { parseDimension, normalizeMargin } from '../lib/util';

import { useFontFamily, useFontText, useFontHeight } from '../../text/providers/font-provider';
import { Glyphs } from '../shape/glyphs';

export type TextProps = {
  /*
  margin?: Margin | number,
  padding?: Margin | number,
  radius?: Margin | number,

  border?: Margin | number,
  stroke?: Point4,
  fill?: Point4,
  */
  
  color?: Point4,

  family?: string,
  style?: string,
  weight?: string | number,
  
  lineHeight?: number,
  size?: number,
  snap?: boolean,

  content?: string,
  children?: string,
};

const BLACK = [0, 0, 0, 1];
const NO_MARGIN = [0, 0, 0, 0];
const NO_STROKE = [0.0, 0.0, 0.0, 0.0];

export const Text: LiveComponent<TextProps> = (props) => {
  const {
    family,
    style,
    weight,
    color = BLACK,
    lineHeight,
    size = 16,
    snap = false,
    content = '',
    children,
  } = props;

  const strings = children ?? content;

  const font = useFontFamily(family, weight, style);
  const {spans, glyphs, breaks} = useFontText(font, strings, size);
  const height = useFontHeight(font, size, lineHeight);

  const {id} = useFiber();
  return yeet({
    spans,
    height,
    render: (lines: InlineLine[]) => (
      keyed(Glyphs, id, {
        id,
        font,
        color,
        size,
        spans,
        glyphs,
        breaks,
        height,
        lines,
        snap,
      })
    ),
  });
};
