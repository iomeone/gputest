import type { XYZW } from '@use-gpu/core';

export type SlideEffect = 'none' | 'fade' | 'wipe' | 'move';
export type SlideEase = 'cosine' | 'linear';

export type SlideDirection = 'left' | 'right' | 'up' | 'down' | 'forward' | 'back' | 'none';

export type ParsedEffect = {
  type: SlideEffect,
  direction: XYZW,
  delay: number,
  duration: number,
  ease: 'cosine' | 'linear',
};

export type SlideTraitProps = {
  order?: number,
  stay?: number,
};

export type SlideInfo = SlideTraitProps & {
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
