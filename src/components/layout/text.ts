import { LiveComponent, LiveElement } from '@use-gpu/live/types';
import { TextureSource } from '@use-gpu/core/types';
import { SpanData, PerSpan, PerGlyph } from '@use-gpu/text/types';
import { Point4, InlineSpan } from './types';

import { use, yeet, useContext, useFiber, useMemo } from '@use-gpu/live';
import { measureFont, measureSpans } from '@use-gpu/text';
import { parseDimension, normalizeMargin } from './lib/util';

import { FontContext } from '../providers/font-provider';
import { Surface } from './surface';

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
  size?: number,
  line?: number,

  content?: string,
};

const BLACK = [0, 0, 0, 1];
const NO_MARGIN = [0, 0, 0, 0];

export const Text: LiveComponent<TextProps> = (props) => {
  const {
    color = BLACK,
    size = 16,
    lineHeight,
    content = '',
  } = props;

  const {gpuText, getGlyph, getScale} = useContext(FontContext);

  const height = useMemo(() => {
    const {ascent, descent, lineHeight: fontHeight} = gpuText.measureFont(size);
    return {ascent, descent, lineHeight: lineHeight ?? fontHeight};
  }, [size, lineHeight]);

  const spanData: SpanData = useMemo(() => {
    const {breaks, metrics, glyphs} = gpuText.measureSpans(content, size);

    const forSpans = (
      callback: PerSpan,
      startIndex: number = 0,
      endIndex: number = breaks.length / 2,
    ) => {
      let end = endIndex * 2;
      for (let i = Math.max(0, startIndex * 2); i < end;) {
        callback(breaks[i + 1], metrics[i], metrics[i + 1], i / 2);
        i += 2;
      }
    };

    const forGlyphs = (
      callback: PerGlyph,
      startIndex: number = 0,
      endIndex: number = breaks.length / 2,
    ) => {
      const start = getStart(startIndex) * 2;
      const end = getEnd(endIndex) * 2;
      for (let i = start; i < end; i += 2) callback(glyphs[i], !!glyphs[i + 1]);
    };

    const getStart = (spanIndex: number) => spanIndex > 0 ? getEnd(spanIndex - 1) : 0;
    const getEnd = (spanIndex: number) => breaks[spanIndex * 2];

    return {forSpans, forGlyphs, getStart, getEnd};
  }, [content, size]);

  return yeet({
    spanData,
    height,
    render: (layout: Rectangle, startIndex: number, endIndex: number, spacing: number) => {
      const {forSpans, forGlyphs} = spanData;
      const scale = getScale(size);
      let [l, t] = layout;

      const out = [] as any[];

      forSpans((_o, _a, _t, index) => {
        forGlyphs((id: number, isWhiteSpace: boolean) => {
          if (!isWhiteSpace) {
            const glyph = getGlyph(id, size);

            if (glyph.image) {
              //console.log('glyph', glyph, 'at', layout[0], layout[1]);              
            }
          }
        }, index, index + 1);
      });

      return null;
      /*
      return yeet({
        sizing,
        margin,
        grow,
        shrink,
        fit: (into: Point) => {
          const w = width != null ? parseDimension(width, into[0], snap) : into[0];
          const h = height != null ? parseDimension(height, into[1], snap) : into[1];
          const size = [w, h];

          const render = (layout: Rectangle): LiveElement<any> => (
            use(Surface, id)({
              id,
              layout,

              stroke,
              fill,
              border,
              radius,

              image,
            })
          );
          return {size, render};
        },
      });
      */
    },
  });
};
