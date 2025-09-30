import type { LiveComponent, LiveNode } from '@use-gpu/live';
import type { ColorLike, XYZW, Rectangle } from '@use-gpu/core';
import type { ShaderModule } from '@use-gpu/shader';
import type { Baseline, InlineLine } from '../types';

import { useProp, shouldEqual, sameShallow } from '@use-gpu/traits/live';
import { parseColor, parseNumber } from '@use-gpu/parse';
import { memo, use, yeet } from '@use-gpu/live';

import { useFontFamily, useFontText, useFontHeight } from '@use-gpu/workbench';
import { Glyphs } from '../shape/glyphs';
import { memoInline } from '../lib/util';

type TextElement = LiveNode;

export type TextProps = {
  opacity?: number,
  color?: ColorLike,
  expand?: number,

  family?: string,
  style?: string,
  weight?: string | number,

  lineHeight?: number,
  size?: number,
  detail?: number,
  snap?: boolean,

  inline?: Baseline,
  text?: string,

  children?: TextElement | TextElement[],
};

type SpanProps = Omit<TextProps, 'children'> & { children?: any };

const BLACK: XYZW = [0, 0, 0, 1];

const toSpan = (props: TextProps) => (child: TextElement) =>
  child != null
    ? typeof child !== 'object'
      ? use(Span, {
          ...props,
          children: null,
          text: typeof child !== 'string'
            ? `${child}`
            : child,
        })
      : child
    : null;

export const Text: LiveComponent<TextProps> = memo((props: TextProps) => {

  // Handle JSX array children
  const content = props.children ?? props.text;
  if (content != null) {
    if (Array.isArray(content)) {
      // Escape loose strings to <Span>
      const fragment = content.map(toSpan(props));
      if (content.length > 1 || typeof fragment[0] === 'object') return fragment;
    }
    else if (typeof content === 'object' && ('f' in content || 'props' in content)) {
      // Render nested <Element>
      return content;
    }
    else {
      // Inline single string
      return InnerSpan(props as SpanProps);
    }
  }

  return null;
}, shouldEqual({
  color: sameShallow(),
}), 'Text');

const InnerSpan: LiveComponent<SpanProps> = (props: SpanProps) => {

  const {
    family,
    style,
    weight,
    lineHeight,
    detail,
    inline,
    expand = 0,
    size = 16,
    snap = false,
    text = '',
    children,
  } = props;

  const content = (children ?? text) as string | string[];

  const font = useFontFamily(family, weight, style);
  const {spans, glyphs, breaks} = useFontText(font, content, size);
  const height = useFontHeight(font, size, lineHeight);

  const color = useProp(props.color, parseColor, BLACK);
  const opacity = useProp(props.opacity, parseNumber, 1);

  return yeet({
    spans,
    height,
    inline,
    render: memoInline((
      lines: InlineLine[],
      origin: Rectangle,
      z: number,
      clip: ShaderModule | null,
      mask: ShaderModule | null,
      transform: ShaderModule | null,
    ) => (
      use(Glyphs, {
        font,
        color: color as any,
        opacity,
        size,
        detail,
        spans,
        glyphs,
        breaks,
        height,
        lines,
        snap,
        expand,

        origin,
        clip,
        mask,
        transform,
        zIndex: z,
      })
    )),
  });
};

const Span = memo(InnerSpan, shouldEqual({
  color: sameShallow(),
}), 'Span');
