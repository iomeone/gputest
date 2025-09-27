import type { LiveFunction, LiveElement } from '@use-gpu/live';

export type PointShape = 'circle' | 'diamond' | 'square' | 'circleOutlined' | 'diamondOutlined' | 'squareOutlined';

export type LayerType = 'point' | 'line';

export type LayerAggregator = (
  device: GPUDevice,
  items: LayerAggregate[],
  keys: Set<string>,
  count: number,
) => (
  items: LayerAggregate[],
  count: number,
) => LiveElement<any>;

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
  | LineAggregate;