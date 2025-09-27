import type { Tuples, Point, Point4, Rectangle } from '@use-gpu/core';
import type { LiveElement, Key } from '@use-gpu/live';
import type { FontMetrics } from '@use-gpu/glyph';
import type { ShaderSource, ShaderModule } from '@use-gpu/shader';
import type { Color, ColorLike } from '@use-gpu/traits';
import { mat4 } from 'gl-matrix';

export type AutoPoint = [number | null, number | null];
export type AutoRectangle = [number | null, number | null, number | null, number | null];
export type Gap = Point;
export type Margin = Point4;
export type Sizing = [number | null, number | null, number, number];

export type Alignment = 'start' | 'center' | 'end' | 'justify' | 'justify-start' | 'justify-center' | 'justify-end' | 'between' | 'evenly';
export type Anchor = 'start' | 'center' | 'end';
export type Base = 'start' | 'base' | 'base-center' | 'center' | 'end';
export type Dimension = number | string;
export type Direction = 'x' | 'y' | 'lr' | 'rl' | 'tb' | 'bt';
export type Fit = 'contain' | 'cover' | 'scale' | 'none';
export type OverflowMode = 'visible' | 'scroll' | 'hidden' | 'auto';
export type Repeat = 'x' | 'y' | 'xy' | 'none';

export type FitInto = [number | null, number | null, number, number];

export type MarginLike = number | number[];
export type GapLike = number | number[];
export type AlignmentLike = Alignment | Alignment[];
export type AnchorLike = Anchor | Anchor[];

export type BoxTrait = {
  grow: number,
  shrink: number,
  margin: MarginLike,
  inline: Base,
  flex: Anchor,
};

export type ElementTrait = {
  width: Dimension,
  height: Dimension,

  radius: MarginLike,
  border: MarginLike,
  stroke: ColorLike,
  fill: ColorLike,
  image: Partial<ImageTrait>,
};

export type ImageTrait = {
  texture: ShaderSource,
  width: Dimension,
  height: Dimension,
  fit: Fit,
  repeat: Repeat,
  align: AnchorLike,
};

export type LayoutRenderer = (box: Rectangle, clip?: ShaderModule, transform?: ShaderModule) => LiveElement<any>;
export type InlineRenderer = (lines: InlineLine[], clip?: ShaderModule, transform?: ShaderModule, version?: number) => LiveElement<any>;

export type LayoutScroller = (x: number, y: number) => void;
export type LayoutPicker = (x: number, y: number, l: number, t: number, r: number, b: number, scroll: boolean) => [number, Rectangle, LayoutScroller] | null;

export type LayoutFit = {
  size: Point,
  render: LayoutRenderer,
  pick?: LayoutPicker | null,
  transform?: ShaderModule,
};

export type LayoutElement = {
  size?: AutoPoint,

  sizing: Sizing,
  margin: Margin,

  ratioX?: number,
  ratioY?: number,

  grow?: number,
  shrink?: number,
  absolute?: boolean,
  under?: boolean,
  stretch?: boolean,
  inline?: Base,
  flex?: Anchor,

  fit: (size: FitInto) => LayoutFit,
  prefit: (size: FitInto) => LayoutFit,
};

export type InlineElement = {
  spans: Tuples<4>,
  height: FontMetrics,
  margin?: Margin,
  inline?: Base,
  block?: LayoutFit,
  absolute?: boolean,
  render: InlineRenderer,
  pick?: LayoutPicker | null,
};

export type InlineLine = {
  layout: Rectangle,
  start: number,
  end: number,
  gap: number,
};

export type UIAggregate = {
  id: string | number,
  count: number,

  rectangles?: number[],
  colors?: number[],
  uvs?: number[],
  repeats?: number[],
  borders?: number[],
  strokes?: number[],
  fills?: number[],
  radiuses?: number[],

  rectangle?: number[],
  color?: number[],
  uv?: number[],
  repeat?: number,
  border?: number[],
  stroke?: number[],
  fill?: number[],
  radius?: number[],

  texture?: ShaderSource,
  clip?: ShaderModule,
  transform?: ShaderModule,
  bounds: Rectangle,
};
