import {
  makeUseTrait,
  useProp,
  parseBoolean,
  parsePosition,
  parseRotation,
  parseQuaternion,
  parseScale,
  parseMatrix,
  optional,
} from '@use-gpu/traits';
import type {
  ObjectTrait,
} from './types';

const OBJECT_TRAIT = {
  position:   optional(parsePosition),
  scale:      optional(parseScale),
  quaternion: optional(parseQuaternion),
  rotation:   optional(parseRotation),
  matrix:     optional(parseMatrix),
  visible:    parseBoolean,
};

const OBJECT_DEFAULTS = {
  visible: true,
};

export const useObjectTrait  = makeUseTrait<ObjectTrait>(OBJECT_TRAIT, OBJECT_DEFAULTS);
