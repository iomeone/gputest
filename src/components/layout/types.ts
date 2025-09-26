import { TextureSource } from '@use-gpu/core/types';
import { LiveElement, Key } from '@use-gpu/live/types';
import { FontMetrics, TextMetrics } from '@use-gpu/text/types';

export type Point = [number, number];
export type Point4 = [number, number, number, number];

export type Dimension = number | string;

export type Gap = Point;
export type Sizing = Point4;
export type Margin = Point4;
export type Rectangle = Point4;
export type Direction = 'x' | 'y' | 'lr' | 'rl' | 'tb' | 'bt';
export type Alignment = 'start' | 'center' | 'end' | 'justify' | 'between' | 'evenly';
export type Anchor = 'start' | 'center' | 'end';
export type Base = 'start' | 'base' | 'center' | 'end';

export type Fit = 'contain' | 'cover' | 'scale' | 'none';
export type Repeat = 'x' | 'y' | 'xy' | 'none';

export type ImageAttachment = {
  texture: TextureSource,
  width?: Dimension,
  height?: Dimension,
  fit?: Fit,
  repeat?: Repeat,
  align?: Anchor | [Anchor, Anchor],
};

export type LayoutRenderer = (box: Rectangle) => LiveElement<any>;
export type InlineRenderer = (box: Rectangle, start: number, end: number, spacing: number) => LiveElement<any>;

export type LayoutFit = {
  size: Point,
  render: LayoutRenderer,
};

export type LayoutElement = {
  sizing: Sizing,
  margin: Margin,

  grow?: number,
  shrink?: number,
  absolute?: boolean,

  fit: (size: Point) => LayoutFit,
};

export type InlineElement = {
  spans: InlineSpan[],
  height: FontMetrics,
  absolute?: boolean,
  render: InlineRenderer,
};

export type InlineSpan = {
  start: number,
  end: number,
  hard: boolean,
  width: TextMetrics,
};

export type UIAggregate = {
  id: number,
  count: number,

  rectangles?: number[],
  colors?: number[],
  textures?: TextureSource[],
  uvs?: number[],
  repeats?: number[],

  rectangle?: number[],
  color?: number[],
  texture?: TextureSource,
  uv?: number[],
  repeat?: number,
};
