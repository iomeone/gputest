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
  parseVec4,
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
  GeographicTrait,
  ObjectTrait,
} from './types';

import { vec4 } from 'gl-matrix';

const GEOGRAPHIC_TRAIT = {
  long: parseNumber,
  lat: parseNumber,
  zoom: parseNumber,
};

const GEOGRAPHIC_DEFAULTS = {
  origin: [0, 0, 0],
  zoom: 1,
};

const OBJECT_TRAIT = {
  position:   optional(parsePosition),
  scale:      optional(parseScale),
  quaternion: optional(parseQuaternion),
  rotation:   optional(parseRotation),
  matrix:     optional(parseMatrix),
};

const OBJECT_DEFAULTS = {};

export const useGeographicTrait = makeUseTrait<GeographicTrait>(GEOGRAPHIC_TRAIT, GEOGRAPHIC_DEFAULTS);
export const useObjectTrait  = makeUseTrait<ObjectTrait>(OBJECT_TRAIT, OBJECT_DEFAULTS);
