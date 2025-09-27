import type { TextureSource } from '@use-gpu/core';
import type { Alignment, AlignmentLike, Anchor, AnchorLike, Base, Dimension, Direction, Fit, Gap, GapLike, Margin, MarginLike, OverflowMode, Repeat } from './types';
import { makeParseEnum, makeParseObject } from '@use-gpu/traits';
 
const explode = new Proxy({}, {get: () => { throw new Error('Invalid texture source'); }}) as any as TextureSource;

export const makeParseDimension = (def: Dimension | null = null) => (x?: string | number): Dimension | null => {
  if (typeof x === 'string' || typeof x === 'number') return x;
  return def;
};

export const makeParseAlignmentXY = (
  def: [Alignment, Alignment] = ['start', 'start'],
) => (
  x?: AlignmentLike,
): [Alignment, Alignment] =>
  Array.isArray(x) ? [x[0] ?? 'start', x[1] ?? 'start'] as [Alignment, Alignment] :
  x != null ? [x, x] as [Alignment, Alignment] :
  def;

export const makeParseAnchorXY = (
  def: [Anchor, Anchor] = ['start', 'start'],
) => (
  x?: AnchorLike,
): [Anchor, Anchor] =>
  Array.isArray(x) ? [x[0] ?? 'start', x[1] ?? 'start'] as [Anchor, Anchor] :
  x != null ? [x, x] as [Anchor, Anchor] :
  def;

export const makeParseGapXY = (def: Gap = [0, 0]) => (g?: GapLike): Gap =>
  Array.isArray(g) ? [g[0] || 0, (g[1] ?? g[0]) || 0] as Gap :
  g != null ? [g, g] as Gap :
  def;

export const makeParseMargin = (def: Margin = [0, 0, 0, 0]) => (m?: MarginLike): Margin =>
  Array.isArray(m) ? [m[0] || 0, m[1] || 0, (m[2] ?? m[0]) || 0, (m[3] ?? m[1]) || 0] :
  m != null ? [m, m, m, m] :
  def;

export const parseTexture = makeParseObject<TextureSource>(explode); 

export const parseAlignment  = makeParseEnum<Alignment>(['start', 'center', 'end', 'justify', 'justify-start', 'justify-center', 'justify-end', 'between', 'evenly']);
export const parseAnchor     = makeParseEnum<Anchor>(['start', 'center', 'end']);
export const parseBase       = makeParseEnum<Base>(['start', 'base', 'base-center', 'center', 'end']);
export const parseDirectionX = makeParseEnum<Direction>(['x', 'y', 'lr', 'rl', 'tb', 'bt']);
export const parseDirectionY = makeParseEnum<Direction>(['y', 'x', 'lr', 'rl', 'tb', 'bt']);
export const parseFit        = makeParseEnum<Fit>(['none', 'contain', 'cover', 'scale']);
export const parseOverflow   = makeParseEnum<OverflowMode>(['visible', 'scroll', 'hidden', 'auto']);
export const parseRepeat     = makeParseEnum<Repeat>(['x', 'y', 'xy', 'none']);

export const parseDimension   = makeParseDimension();
export const parseAlignmentXY = makeParseAlignmentXY();
export const parseAnchorXY    = makeParseAnchorXY();
export const parseGapXY       = makeParseGapXY();
export const parseMargin      = makeParseMargin();

export const evaluateDimension = (x: string | number | null | undefined, total: number | null, snap: boolean = false): number | null => {
  if (typeof x === 'number') return snap ? Math.round(x) : x;
  if (x == null) return total != null ? (snap ? Math.round(total) : total) : null;

  let v;
  const s = x as string;
  if (s[s.length - 1] === '%') {
    if (total == null) return null;
    v = +s.slice(0, -1) / 100 * total;
  }
  else {
    v = +s;
  }

  return snap ? Math.round(v) : v;
}

