import {
  makeUseTrait,
  makeParseTrait,
  optional,
  nullable,
  trait,
} from '@use-gpu/traits/live';
import {
  parseNumber,
  parseInteger,
  parseColor,
} from '@use-gpu/parse';
import {
  parseAnchor,
  parseAnchorXY,
  parseBaseline,
  parseDimension,
  parseFit,
  parseMargin,
  parseRepeat,
  parseTexture,
} from './parse';

export const BoxTrait = trait({
  grow: parseNumber,
  shrink: parseNumber,
  margin: parseMargin,
  inline: optional(parseBaseline),
  flex: optional(parseAnchor),
}, {
  shrink: 1,
});

export const ImageTrait = trait({
  texture: optional(nullable(parseTexture)), // deprecated
  width: optional(parseDimension),
  height: optional(parseDimension),
  fit: parseFit,
  repeat: parseRepeat,
  align: parseAnchorXY,
});

export const ElementTrait = trait({
  width: optional(parseDimension),
  height: optional(parseDimension),
  aspect: optional(parseNumber),

  radius: optional(parseMargin),
  border: optional(parseMargin),
  stroke: optional(parseColor),
  fill: optional(parseColor),

  texture: optional(nullable(parseTexture)), // deprecated
  image: optional(makeParseTrait(ImageTrait)),
  zIndex: parseInteger,
});

export const useBoxTrait     = makeUseTrait(BoxTrait);
export const useElementTrait = makeUseTrait(ElementTrait);
export const useImageTrait   = makeUseTrait(ImageTrait);
