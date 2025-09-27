import { useOne } from '@use-gpu/live';
import {
  parseFloat,
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
  parseRange,
  parseRanges,
  parseAxes,
  parseAxis,
  parseDetail,
  parseDomain,
  parseJoin,
  parseBlending,
  parsePlacement,
  parseFlip,
  parseWeight,
  parsePointShape,
  optional,
} from './util/parse';
import {
  PropDef,
  AnchorTrait,
  ArrowTrait,
  AxesTrait,
  AxisTrait,
  ColorTrait,
  FontTrait,
  LabelTrait,
  LineTrait,
  ObjectTrait,
  ROPTrait,
  ScaleTrait,
} from './types';

import { vec4 } from 'gl-matrix';

const EMPTY: any[] = [];
const WHITE = [1, 1, 1, 1];

const ANCHOR_TRAIT = {
  placement:  parsePlacement,
  flip:       parseFlip,
  offset:     parseFloat,
};

const ANCHOR_DEFAULTS = {
  placement: 'center',
  flip: 'none',
  offset: 5,
};

const ARROW_TRAIT = {
  size: parseFloat,
  start: parseBoolean,
  end: parseBoolean,
};

const ARROW_DEFAULTS = {
  size: 4,
  start: false,
  end: true,
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
  size:       parseFloat,
  depth:      parseFloat,
  expand:     parseFloat,
};

const LABEL_DEFAULTS = {
  size: 16,
};

const LINE_TRAIT = {
  width:     parseFloat,
  depth:     parseFloat,
  join:      parseJoin,
  loop:      parseBoolean,
  dash:      parseVector,
  proximity: parseFloat,
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
  size:      parseFloat,
  depth:     parseFloat,
  shape:     parsePointShape,
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
  zBias:    parseFloat,
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
  divide: parseFloat,
  unit:   parseFloat,
  base:   parseFloat,
  start:  parseBoolean,
  end:    parseBoolean,
  zero:   parseBoolean,
  factor: parseFloat,
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

export const useProp = <T>(value?: T, parse: (t?: T) => T, def?: T): T =>
  useOne(() => def !== undefined && value === undefined ? def : parse(value), value);

type UseTrait<T> = (props: Partial<T>) => T;

export const makeUseTrait = <T>(propDef: PropDef, defaultValues: Record<string, any>): UseTrait<T> => {
  const defaults = {};
  for (const k in defaultValues) defaults[k] = propDef[k](defaultValues[k]);
  return (props: Partial<T>) => useTrait(props, propDef, defaults);
};

const useTrait = <T extends Record<string, any>>(props: Partial<T>, propDef: PropDef, defaults: Record<string, any>): T => {
  const parsed: Record<string, any> = useOne(() => ({}));

  for (let k in propDef) {
    const v = props[k];
    parsed[k] = useProp(v, propDef[k], defaults ? defaults[k] : undefined);
  }

  return parsed as T;
};

export const useAnchorTrait = makeUseTrait<AnchorTrait>(ANCHOR_TRAIT, ANCHOR_DEFAULTS);
export const useArrowTrait  = makeUseTrait<ArrowTrait>(ARROW_TRAIT, ARROW_DEFAULTS);
export const useAxesTrait   = makeUseTrait<AxesTrait>(AXES_TRAIT, AXES_DEFAULTS);
export const useAxisTrait   = makeUseTrait<AxisTrait>(AXIS_TRAIT, AXIS_DEFAULTS);
export const useFontTrait   = makeUseTrait<FontTrait>(FONT_TRAIT, FONT_DEFAULTS);
export const useGridTrait   = makeUseTrait<GridTrait>(GRID_TRAIT, GRID_DEFAULTS);
export const useLabelTrait  = makeUseTrait<LabelTrait>(LABEL_TRAIT, LABEL_DEFAULTS);
export const useLineTrait   = makeUseTrait<LineTrait>(LINE_TRAIT, LINE_DEFAULTS);
export const useObjectTrait = makeUseTrait<ObjectTrait>(OBJECT_TRAIT, OBJECT_DEFAULTS);
export const useROPTrait    = makeUseTrait<ROPTrait>(ROP_TRAIT, ROP_DEFAULTS);
export const useScaleTrait  = makeUseTrait<ScaleTrait>(SCALE_TRAIT, SCALE_DEFAULTS);

export const useColorTrait = (props: Partial<ColorTrait>): vec4 => {
  const {
    color = [0.5, 0.5, 0.5, 1],
    opacity = 1,
  } = props;

  const vec = useOne(() => vec4.create());
  const c = useProp(color, parseColor);
  const o = useProp(opacity, parseFloat);

  if (o === 1) return vec4.copy(vec, c);
  return vec4.set(vec, c[0], c[1], c[2], c[3] * o);
};
