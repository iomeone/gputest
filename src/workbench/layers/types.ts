import type { LiveFunction, LiveElement } from '@use-gpu/live';

export type PointShape = 'circle' | 'diamond' | 'square' | 'circleOutlined' | 'diamondOutlined' | 'squareOutlined';

export type LayerType = 'point' | 'line';

export type LayerAggregator = (
  device: GPUDevice,
  items: LayerAggregate[],
  keys: Set<string>,
  count: number,
  indices?: number,
) => (
  items: LayerAggregate[],
  count: number,
  indices?: number,
) => LiveElement;

export type PointAggregate = {
  type: 'point',
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
  type: 'line',
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

export type FaceAggregate = {
  type: 'face',
  id: number,
  count: number,

  cullMode?: 'front' | 'back' | 'none',

  positions?: number[],
  indices?: number[],
  colors?: number[],
  sizes?: number[],
  depths?: number[],

  position?: number[],
  index?: number[],
  color?: number[],
  size?: number[],
  depth?: number,
};

export type LayerAggregate =
  | PointAggregate
  | LineAggregate
  | FaceAggregate;