import type { XYZW } from '@use-gpu/core';
import type {
  SlideDirection,
  SlideEase,
  SlideEffect,
} from './types';

import {
  makeUseTrait,
  makeParseTrait,
  optional,
  trait,
} from '@use-gpu/traits/live';
import {
  makeParseEnum,
  parseInteger,
  parseNumber,
} from '@use-gpu/parse';

import mapValues from 'lodash/mapValues.js';

export const SLIDE_EFFECTS: SlideEffect[] = ['none', 'fade', 'wipe', 'move'];

export const SLIDE_DIRECTIONS: Record<SlideDirection, XYZW> = {
  left: [-1, 0, 0, 0],
  right: [1, 0, 0, 0],
  up: [0, -1, 0, 0],
  down: [0, 1, 0, 0],
  forward: [0, 0, -1, 0],
  back: [0, 0, 1, 0],
  none: [0, 0, 0, 0],
};

const parseSlideDirection = (s: any): XYZW => {
  if (s in SLIDE_DIRECTIONS) return SLIDE_DIRECTIONS[s as SlideDirection];
  if (s.length) return s;
  return SLIDE_DIRECTIONS['right'];
};

const EFFECT_TRAIT = {
  type: makeParseEnum<SlideEffect>(SLIDE_EFFECTS),
  ease: makeParseEnum<SlideEase>(['cosine', 'linear']),
  direction: parseSlideDirection,
  delay: parseNumber,
  duration: parseNumber,
};

const EFFECT_DEFAULTS = {
  effect: 'fade',
  direction: 'right',
  ease: 'cosine',
  delay: 0,
  duration: 0.15,
};

const PARTIAL_EFFECT_TRAIT = mapValues(EFFECT_TRAIT, (t: any) => optional(t));

export const EffectTrait = trait(EFFECT_TRAIT, EFFECT_DEFAULTS);
export const PartialEffectTrait = trait(PARTIAL_EFFECT_TRAIT, {});

export const SlideTrait = trait({
  order: optional(parseInteger),
  stay: optional(parseInteger),
});

const parseEffectTrait = makeParseTrait(EffectTrait);
const parsePartialEffectTrait = makeParseTrait(PartialEffectTrait);

const TRANSITION_TRAIT = {
  effect: parseEffectTrait,
  enter: optional(parsePartialEffectTrait),
  exit: optional(parsePartialEffectTrait),
};

const TRANSITION_DEFAULTS = {
  effect: {},
};

export const TransitionTrait = trait(TRANSITION_TRAIT, TRANSITION_DEFAULTS);

export const useEffectTrait = makeUseTrait(EffectTrait);
export const useSlideTrait = makeUseTrait(SlideTrait);
export const useTransitionTrait = makeUseTrait(TransitionTrait);

export const makeUseTransitionTrait = (defaults: any) =>
  makeUseTrait(trait(TRANSITION_TRAIT, {...TRANSITION_DEFAULTS, ...defaults}));
