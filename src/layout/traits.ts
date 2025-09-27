import type {
  BoxTrait,
  ElementTrait,
  ImageTrait,
} from './types';
import {
  makeUseTrait,
  makeParseTrait,
  optional,
  parseNumber,
  parseColor,
} from '@use-gpu/traits';
import {
  parseAlignmentXY,
  parseAnchor,
  parseAnchorXY,
  parseBase,
  parseDimension,
  parseFit,
  parseMargin,
  parseRepeat,
  parseTexture,
} from './parse';

const BOX_TRAIT = {
  grow: parseNumber,
  shrink: parseNumber,
  margin: parseMargin,
  inline: optional(parseBase),
  flex: optional(parseAnchor),
};

const BOX_DEFAULTS = {
  shrink: 1,
};

const IMAGE_TRAIT = {
  width: optional(parseDimension),
  height: optional(parseDimension),
  texture: optional(parseTexture),
  fit: parseFit,
  repeat: parseRepeat,
  align: parseAnchorXY,
};

const IMAGE_DEFAULTS = {};

const ELEMENT_TRAIT = {
  width: optional(parseDimension),
  height: optional(parseDimension),
  
  radius: optional(parseMargin),
  border: optional(parseMargin),
  stroke: optional(parseColor),
  fill: optional(parseColor),

  image: optional(makeParseTrait(IMAGE_TRAIT, IMAGE_DEFAULTS)),
};

const ELEMENT_DEFAULTS = {};

export const useBoxTrait     = makeUseTrait<BoxTrait>(BOX_TRAIT, BOX_DEFAULTS);
export const useElementTrait = makeUseTrait<ElementTrait>(ELEMENT_TRAIT, ELEMENT_DEFAULTS);
export const useImageTrait   = makeUseTrait<ImageTrait>(IMAGE_TRAIT, IMAGE_DEFAULTS);
