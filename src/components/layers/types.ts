import { LiveFunction } from '@use-gpu/live/types';
import { TextureSource } from '@use-gpu/core/types';

export enum LayerType {
  Point = 'point',
  Line = 'line',
  Rectangle = 'rectangle',
};

export type LayerAggregatorDef = [LayerAggregator, LiveFunction<any>, LiveFunction<any>];

export type LayerAggregator = (
  device: GPUDevice,
  items: LineAggregate[],
  keys: Set<string>,
  count: number,
) => (items: LineAggregate[]) => void;

export type RectangleAggregate = {
  id: number,
  count: number,

  rectangles?: number[],
  colors?: number[],
  textures?: TextureSource,
  uvs?: number[],

  rectangle?: number[],
  color?: number[],
  texture?: TextureSource,
  uv?: number[],
};

export type PointAggregate = {
  id: number,
  count: number,

  positions?: number[],
  colors?: number[],
  sizes?: number[],
  depths?: number[],

  position?: number[],
  color?: number[],
  size?: number[],
  depth?: number,
};

export type LineAggregate = {
  id: number,
  count: number,
  isLoop?: boolean,

  positions?: number[],
  segments?: number[],
  colors?: number[],
  sizes?: number[],
  depths?: number[],

  position?: number[],
  segment?: number[],
  color?: number[],
  size?: number[],
  depth?: number,
};

export type LayerAggregate =
  | PointAggregate
  | LineAggregate
  | RectangleAggregate;