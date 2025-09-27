import { useOne } from '@use-gpu/live';
import {
  makeUseTrait,
  useProp,
  parseNumber,
  parseInteger,
  parseBoolean,
  parseString,
  parseStringArray,
  parseStringFormatter,
  parseVector,
  parsePosition4,
  parsePosition,
  parseRotation,
  parseQuaternion,
  parseColor,
  parseScale,
  parseMatrix,
  parseJoin,
  parseBlending,
  parsePlacement,
  parseWeight,
  parseRange,
  parseRanges,
  parseAxes,
  parseAxis,
  parseIntegerPositive,
  parseDomain,
  optional,
} from '@use-gpu/traits';
import {
  parsePointShape,
} from '@use-gpu/workbench';
import type {
  AnchorTrait,
  ArrowTrait,
  AxesTrait,
  AxisTrait,
  ColorTrait,
  FontTrait,
  GridTrait,
  LabelTrait,
  LineTrait,
  ObjectTrait,
  PointTrait,
  ROPTrait,
  ScaleTrait,
  SurfaceTrait,
} from './types';

import { vec4 } from 'gl-matrix';

const EMPTY: any[] = [];
const WHITE = [1, 1, 1, 1];

const ANCHOR_TRAIT = {
  placement:  parsePlacement,
  offset:     parseNumber,
};

const ANCHOR_DEFAULTS = {
  placement: 'center',
  offset: 5,
};

const ARROW_TRAIT = {
  size: parseNumber,
  start: parseBoolean,
  end: parseBoolean,
  detail: parseIntegerPositive,
};

const ARROW_DEFAULTS = {
  size: 3,
  start: false,
  end: true,
  detail: 12,
};

const AXES_TRAIT = {
  axes:  parseAxes,
  range: parseRanges,
};

const AXES_DEFAULTS = {
  axes: 'xyzw',
  range: null,
};

const AXIS_TRAIT = {
  axis:  parseAxis,
  range: optional(parseRange),
};

const AXIS_DEFAULTS = {
  axis: 'x',
};

const FONT_TRAIT = {
  family: optional(parseString),
  weight: optional(parseWeight),
  style: optional(parseString),
};

const FONT_DEFAULTS = {};

const GRID_TRAIT = {
  axes:  parseAxes,
  range: optional(parseRanges),
};

const GRID_DEFAULTS = {
  axes: 'xy',
};

const LABEL_TRAIT = {
  labels:     optional(parseStringArray),
  format:     optional(parseStringFormatter),
  size:       parseNumber,
  depth:      parseNumber,
  expand:     parseNumber,
};

const LABEL_DEFAULTS = {
  size: 16,
};

const LINE_TRAIT = {
  width:     parseNumber,
  depth:     parseNumber,
  join:      parseJoin,
  loop:      parseBoolean,
  dash:      parseVector,
  proximity: parseNumber,
};

const LINE_DEFAULTS = {
  width: 1,
  depth: 0,
  join: 'bevel',
  loop: false,
  proximity: 0,
};

const OBJECT_TRAIT = {
  position:   optional(parsePosition),
  scale:      optional(parseScale),
  quaternion: optional(parseQuaternion),
  rotation:   optional(parseRotation),
  matrix:     optional(parseMatrix),
};

const OBJECT_DEFAULTS = {};

const POINT_TRAIT = {
  size:  parseNumber,
  depth: parseNumber,
  shape: parsePointShape,
};

const POINT_DEFAULTS = {
  size: 1,
  depth: 0,
  shape: 'circle',
};

const ROP_TRAIT = {
  blending: parseBlending,
  zWrite:   parseBoolean,
  zTest:    parseBoolean,
  zBias:    parseNumber,
  zIndex:   parseInteger,
};

const ROP_DEFAULTS = {
  blending: 'normal',
  zWrite: true,
  zTest: true,
  zBias: 0,
  zIndex: 0,
};

const SCALE_TRAIT = {
  mode:   parseDomain,
  divide: parseNumber,
  unit:   parseNumber,
  base:   parseNumber,
  start:  parseBoolean,
  end:    parseBoolean,
  zero:   parseBoolean,
  factor: parseNumber,
  nice:   parseBoolean,
};

const SCALE_DEFAULTS = {
  mode: 'linear',
  divide: 10,
  unit: 1,
  base: 10,
  start: true,
  end: false,
  zero: true,
  factor: 1,
  nice: true,
};

const SURFACE_TRAIT = {
  loopX: parseBoolean,
  loopY: parseBoolean,
  shaded: parseBoolean,
};

const SURFACE_DEFAULTS = {
  loopX: false,
  loopY: false,
  shaded: true,
};

const VOLUME_TRAIT = {
  loopX: parseBoolean,
  loopY: parseBoolean,
  loopZ: parseBoolean,
  shaded: parseBoolean,
};

const VOLUME_DEFAULTS = {
  loopX: false,
  loopY: false,
  loopZ: false,
  shaded: true,
};

/** @category Traits */
export const useAnchorTrait  = makeUseTrait<AnchorTrait>(ANCHOR_TRAIT, ANCHOR_DEFAULTS);
/** @category Traits */
export const useArrowTrait   = makeUseTrait<ArrowTrait>(ARROW_TRAIT, ARROW_DEFAULTS);
/** @category Traits */
export const useAxesTrait    = makeUseTrait<AxesTrait>(AXES_TRAIT, AXES_DEFAULTS);
/** @category Traits */
export const useAxisTrait    = makeUseTrait<AxisTrait>(AXIS_TRAIT, AXIS_DEFAULTS);
/** @category Traits */
export const useFontTrait    = makeUseTrait<FontTrait>(FONT_TRAIT, FONT_DEFAULTS);
/** @category Traits */
export const useGridTrait    = makeUseTrait<GridTrait>(GRID_TRAIT, GRID_DEFAULTS);
/** @category Traits */
export const useLabelTrait   = makeUseTrait<LabelTrait>(LABEL_TRAIT, LABEL_DEFAULTS);
/** @category Traits */
export const useLineTrait    = makeUseTrait<LineTrait>(LINE_TRAIT, LINE_DEFAULTS);
/** @category Traits */
export const useObjectTrait  = makeUseTrait<ObjectTrait>(OBJECT_TRAIT, OBJECT_DEFAULTS);
/** @category Traits */
export const usePointTrait   = makeUseTrait<PointTrait>(POINT_TRAIT, POINT_DEFAULTS);
/** @category Traits */
export const useROPTrait     = makeUseTrait<ROPTrait>(ROP_TRAIT, ROP_DEFAULTS);
/** @category Traits */
export const useScaleTrait   = makeUseTrait<ScaleTrait>(SCALE_TRAIT, SCALE_DEFAULTS);
/** @category Traits */
export const useSurfaceTrait = makeUseTrait<SurfaceTrait>(SURFACE_TRAIT, SURFACE_DEFAULTS);
/** @category Traits */
export const useVolumeTrait = makeUseTrait<SurfaceTrait>(VOLUME_TRAIT, VOLUME_DEFAULTS);

/** @category Traits */
export const useColorTrait = (props: Partial<ColorTrait>): vec4 => {
  const {
    color = [0.5, 0.5, 0.5, 1],
    opacity = 1,
  } = props;

  const vec = useOne(() => vec4.create());
  const c = useProp(color, parseColor);
  const o = useProp(opacity, parseNumber);

  if (o === 1) return vec4.copy(vec, c);
  return vec4.set(vec, c[0], c[1], c[2], c[3] * o);
};
