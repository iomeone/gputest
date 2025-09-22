import { LiveElement, Key } from '@use-gpu/live/types';

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

export type Fit = 'fit' | 'cover' | 'scale' | 'none';
export type Repeat = 'x' | 'y' | 'xy' | 'none';

export type LayoutRenderer = (box: Rectangle) => LiveElement<any>;
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
  key: Key,
};

export type LayoutState = Rectangle;

export type LayoutResult = {
  box: Rectangle,
  margin: Margin,
  size: Point,
  grow: number,
  shrink: number,

  results?: LayoutResult[],
  render?: (layout: LayoutState) => LiveElement<any>,
};

export type LayoutGenerator = (layout: LayoutState) => LayoutResult;
export type LayoutResolver = (layout: LayoutState, ls: LayoutHandler[]) => LayoutResult;
