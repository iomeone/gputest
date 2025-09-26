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
  snap?: boolean,

  content?: string,
};

const BLACK = [0, 0, 0, 1];
const NO_MARGIN = [0, 0, 0, 0];

export const Text: LiveComponent<TextProps> = (props) => {
  const {
    color = BLACK,
    size = 16,
    snap = false,
    lineHeight,
    content = '',
  } = props;

  const {gpuText, source, getGlyph, getScale, getRadius} = useContext(FontContext);

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
      const end = getEnd(endIndex - 1) * 2;
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
      const [l, t] = layout;

      const out = [] as any[];

      const rects = [] as number[];
      const uvs = [] as number[];
      let count = 0;

      const {ascent, descent, lineHeight} = height;
      const h = ascent - descent;
      const g = (lineHeight - h) / 2;
      const base = h + g;

      let x = l;
      let y = t + base;

      let sx = x;

      forSpans((_o, _a, trim, index) => {
        forGlyphs((id: number, isWhiteSpace: boolean) => {
          const {glyph, mapping} = getGlyph(id, size);
          const {image, layoutBounds, outlineBounds} = glyph;
          const [ll, lt, lr, lb] = layoutBounds;

          if (!isWhiteSpace) {
            if (image) {
              const [gl, gt, gr, gb] = outlineBounds;

              const cx = snap ? Math.round(sx) : sx;
              const cy = snap ? Math.round(y) : y;
              
              rects.push((scale * gl) + cx, (scale * gt) + cy, (scale * gr) + cx, (scale * gb) + cy);
              uvs.push(...mapping.uv);
              count++;
            }
          }

          sx += lr * scale;
          x += lr * scale;
        }, index, index + 1);

        if (trim) {
          x += spacing;
          sx = snap ? Math.round(x) : x;
        }
      }, startIndex, endIndex);

      const render = {
        rectangles: rects,
        radius: [1 / scale, getRadius(), 0, 0],
        fill: [0.5, 0.5, 0.5, 1.0],
        stroke: [1.0, 1.0, 1.0, 1.0],
        texture: source,
        uvs: uvs,
        repeat: -1,

        count,
      };
      console.log(scale)

      //return use(() => yeet(render))();
      return yeet(render);
    },
  });
};
