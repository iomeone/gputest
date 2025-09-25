import { LiveComponent, LiveElement } from '@use-gpu/live/types';
import { TextureSource } from '@use-gpu/core/types';
import { Point4, InlineSpan } from './types';

import { use, yeet, useFiber, useMemo } from '@use-gpu/live';
import { getLineBreaks, measureFont, measureText } from '@use-gpu/text';
import { parseDimension, normalizeMargin } from './lib/util';

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
    line,
    content = '',
  } = props;

  const height = useMemo(() => {
    const {ascent, descent, lineHeight} = measureFont(size);
    return {ascent, descent, lineHeight: line ?? lineHeight};
  }, [size, line]);

  const spans = useMemo(() => {
    const spans: InlineSpan[] = [];

    const breaks = getLineBreaks(content);
    
    let start = 0;
    const n = breaks.length;
    for (let i = 0; i < n; i += 2) {
      const end = breaks[i];
      const hard = breaks[i + 1];

      const text = content.slice(start, end);
      const width = measureText(text, size);

      spans.push({start, end, hard, width});

      start = end;
    }

    return spans;
  }, [content, size]);

  return yeet({
    spans,
    height,
    render: (layout: Rectangle, startIndex: number, endIndex: number) => {
      const start = spans[startIndex].start;
      const end = spans[endIndex - 1].end;
      console.log('render', content.slice(start, end), 'at', layout[0], layout[1]);
      return null;
    },
  });
};
