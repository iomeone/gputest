import type { LiveComponent } from '@use-gpu/live';
import type { ArchetypeSchema, TypedArray } from '@use-gpu/core';
import type { LineLayerFlags } from './line-layer';
import type { FaceLayerFlags } from './face-layer';
import type { PointLayerFlags } from './point-layer';
import type { ArrowLayerFlags } from './arrow-layer';
import type { MaterialContextProps } from '../providers/material-provider';
import type { ScissorContextProps } from '../providers/scissor-provider';
import type { TransformContextProps } from '../providers/transform-provider';

export type LayerType = 'point' | 'line' | 'arrow' | 'face' | 'element';

export type LayerAggregator = {
  schema: ArchetypeSchema,
  component: LiveComponent,
};

export type BaseAggregate = {
  archetype: number,
  transform?: TransformContextProps,
  material?: MaterialContextProps,
  scissor?: ScissorContextProps,
  schema?: ArchetypeSchema,
  sources?: Record<string, any>,
  zIndex?: number,
};

export type ShapeAggregate = BaseAggregate & {
  count: number,
  indexed?: number,
  instanced?: number,
  slices?: number[],
};

export type PointAggregate = ShapeAggregate & {
  flags: PointLayerFlags,
  attributes: {
    position?: TypedArray,
    positions?: TypedArray,
    color?: TypedArray,
    colors?: TypedArray,
    size?: number,
    sizes?: TypedArray,
    depth?: number,
    depths?: TypedArray,
    zBias?: number,
    zBiases?: TypedArray,
    zIndex: number,

    id?: number,
    ids?: TypedArray,
    lookup?: number,
    lookups?: TypedArray,
  },
};

export type LineAggregate = ShapeAggregate & {
  flags: LineLayerFlags,
  attributes: {
    position?: TypedArray,
    positions?: TypedArray,
    color?: TypedArray,
    colors?: TypedArray,
    size?: number | TypedArray,
    sizes?: TypedArray,
    depth?: number | TypedArray,
    depths?: TypedArray,
    zBias?: number | TypedArray,
    zBiases?: TypedArray,
    zIndex: number,

    segments?: TypedArray,
    unweld?: TypedArray,

    id?: number | TypedArray,
    ids?: TypedArray,
    lookup?: number | TypedArray,
    lookups?: TypedArray,
  },
};

export type ArrowAggregate = ShapeAggregate & {
  flags: ArrowLayerFlags,
  attributes: {
    position?: TypedArray,
    positions?: TypedArray,
    color?: TypedArray,
    colors?: TypedArray,
    size?: number | TypedArray,
    sizes?: TypedArray,
    depth?: number | TypedArray,
    depths?: TypedArray,
    zBias?: number | TypedArray,
    zBiases?: TypedArray,
    zIndex: number,

    segments?: TypedArray,
    unweld?: TypedArray,
    anchors?: TypedArray,
    trims?: TypedArray,

    id?: number | TypedArray,
    ids?: TypedArray,
    lookup?: number | TypedArray,
    lookups?: TypedArray,
  },
};

export type FaceAggregate = ShapeAggregate & {
  flags: FaceLayerFlags,
  attributes: {
    position?: TypedArray,
    positions?: TypedArray,
    color?: TypedArray,
    colors?: TypedArray,
    size?: number | TypedArray,
    sizes?: TypedArray,
    depth?: number | TypedArray,
    depths?: TypedArray,
    zBias?: number | TypedArray,
    zBiases?: TypedArray,
    zIndex: number,

    segments?: TypedArray,
    indices?: number[],

    id?: number | TypedArray,
    ids?: TypedArray,
    lookup?: number | TypedArray,
    lookups?: TypedArray,
  },
};

export type LayerAggregate = PointAggregate | LineAggregate | ArrowAggregate | FaceAggregate;

export type LayerAggregates = {
  point?: PointAggregate | PointAggregate[],
  line?: LineAggregate | LineAggregate[],
  arrow?: ArrowAggregate | ArrowAggregate[],
  face?: FaceAggregate | FaceAggregate[],
};
