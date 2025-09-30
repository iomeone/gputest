import type { Tuples, XY, XYZW, Rectangle } from '@use-gpu/core';
import type { LiveElement } from '@use-gpu/live';
import type { FontMetrics } from '@use-gpu/glyph';
import type { ShaderSource, ShaderModule } from '@use-gpu/shader';

export type AutoXY = [number | null, number | null];
export type AutoRectangle = [number | null, number | null, number | null, number | null];
export type FitInto = [number | null, number | null, number, number];

export type Gap = XY;
export type Margin = XYZW;
export type Sizing = [number | null, number | null, number, number];

export type Alignment = 'start' | 'center' | 'end' | 'justify' | 'justify-start' | 'justify-center' | 'justify-end' | 'between' | 'evenly';
export type Anchor = 'start' | 'center' | 'end';
export type Baseline = 'start' | 'base' | 'base-center' | 'center' | 'end';
export type Dimension = number | string;
export type Direction = 'x' | 'y' | 'lr' | 'rl' | 'tb' | 'bt';
export type Fit = 'contain' | 'cover' | 'scale' | 'none';
export type OverflowMode = 'visible' | 'scroll' | 'hidden' | 'auto';
export type Repeat = 'x' | 'y' | 'xy' | 'none';

export type MarginLike = number | number[];
export type GapLike = number | number[];
export type AlignmentLike = Alignment | Alignment[];
export type AnchorLike = Anchor | Anchor[];

export type LayoutRenderer = (
  box: Rectangle,
  origin: Rectangle,
  z: number,
  clip: ShaderModule | null,
  mask: ShaderModule | null,
  transform: ShaderModule | null,
) => LiveElement;

export type RenderInside = {
  sizes: XY[],
  offsets: XY[],
  renders: LayoutRenderer[],
  clip?: ShaderModule | null,
  mask?: ShaderModule | null,
  transform?: ShaderModule | null,
  inverse?: ShaderModule | null,
};

export type RenderInline = {
  ranges: XY[],
  sizes: XY[],
  offsets: [number, number, number][],
  renders: InlineRenderer[],
  key?: number,
};

export type RenderOutside = {
  box: Rectangle,
  origin: Rectangle,
  z: number,
  clip?: ShaderModule | null,
  mask?: ShaderModule | null,
  transform?: ShaderModule | null,
  ref?: (rectangle: Rectangle, origin: Rectangle) => LiveElement,
};

export type InlineRenderer = (
  lines: InlineLine[],
  origin: Rectangle,
  z: number,
  clip: ShaderModule | null,
  mask: ShaderModule | null,
  transform: ShaderModule | null,
  version?: number
) => LiveElement;

export type LayoutShaders = {
  texture?: ShaderSource | null,
  transform?: ShaderModule | null,
  clip?: ShaderModule | null,
  mask?: ShaderModule | null,
};

export type LayoutScroller = (x: number, y: number) => void;
export type LayoutPicker = (x: number, y: number, l: number, t: number, r: number, b: number, scroll: boolean) => [number, Rectangle, LayoutScroller] | null;

export type LayoutFit = {
  size: XY,
  render: LayoutRenderer,
  pick?: LayoutPicker | null,
  transform?: ShaderModule,
};

export type LayoutElement = {
  size?: AutoXY,

  sizing: Sizing,
  margin: Margin,

  ratioX?: number,
  ratioY?: number,

  grow?: number,
  shrink?: number,
  absolute?: boolean,
  under?: boolean,
  stretch?: boolean,
  inline?: Baseline,
  flex?: Anchor,

  fit: (size: FitInto) => LayoutFit,
  prefit: (size: FitInto) => LayoutFit,
};

export type InlineElement = {
  spans: Tuples<3>,
  height: FontMetrics,
  margin?: Margin,
  inline?: Baseline,
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

export type UIAggregate = LayoutShaders & {
  archetype: number,
  bounds?: Rectangle,
  count: number,
  zIndex?: number,

  attributes: {
    rectangles?: number[],
    colors?: number[],
    uvs?: number[],
    sts?: number[],
    repeats?: number[],
    borders?: number[],
    strokes?: number[],
    fills?: number[],
    radii?: number[],
    sdfs?: number[],

    rectangle?: number[],
    color?: number[],
    uv?: number[],
    st?: number[],
    repeat?: number,
    border?: number[],
    stroke?: number[],
    fill?: number[],
    radius?: number[],
    sdf?: number[],
  },
};
