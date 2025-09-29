import type { Point4 } from '@use-gpu/core';

export type SlideEffect = 'none' | 'fade' | 'wipe' | 'move';
export type SlideEase = 'cosine' | 'linear';

export type SlideDirection = 'left' | 'right' | 'up' | 'down' | 'forward' | 'back' | 'none';

export type EffectTrait = {
  type: SlideEffect,
  direction: string,
  delay: number,
  duration: number,
  ease: 'cosine' | 'linear',
};

export type TransitionTrait = {
  effect?: EffectTrait,
  enter?: Partial<EffectTrait>,
  exit?: Partial<EffectTrait>,
};

export type ParsedEffect = {
  type: SlideEffect,
  direction: Point4,
  delay: number,
  duration: number,
  ease: 'cosine' | 'linear',
};

export type SlideTrait = {
  order?: number,
  stay?: number,
};

export type SlideInfo = SlideTrait & {
  id: number,
  steps?: number,
  slides?: ResolvedSlide[],
  sticky?: boolean,
  thread?: boolean,
};

export type ResolvedSlide = {
  id: number,
  from: number,
  to: number,
  sticky?: boolean,
  thread?: boolean,
};

export type ResolvedLayer = {
  id: number,
  enter: ParsedEffect,
  exit: ParsedEffect,
  ops: any,
};
