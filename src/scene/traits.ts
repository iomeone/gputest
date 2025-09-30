import type { VectorLike } from '../core';
import { useMemo } from '../live';
import { optional, trait, makeUseTrait } from '../traits/index-live';
import {
  parseBoolean,
  parsePosition,
  parseRotation,
  parseQuaternion,
  parseScale,
  parseMatrix,
  parseColorOpacity,
} from '../parse';
import { vec4 } from 'gl-matrix';

export const ObjectTrait = trait({
  position:   optional(parsePosition),
  scale:      optional(parseScale),
  quaternion: optional(parseQuaternion),
  rotation:   optional(parseRotation),
  matrix:     optional(parseMatrix),
  visible:    parseBoolean,
}, {
  visible: true,
});

const WHITE = [1, 1, 1, 1];

export const ColorTrait = (
  props: {
    color?: VectorLike | string,
    opacity?: number,
  },
  parsed: {
    color?: vec4
  },
) => {
  const {color = WHITE, opacity = 1} = props;
  const rgba = useMemo(() => parseColorOpacity(color, opacity), [color, opacity]);
  parsed.color = rgba != null ? rgba : undefined;
};

export const useColorTrait = makeUseTrait(ColorTrait);
export const useObjectTrait = makeUseTrait(ObjectTrait);