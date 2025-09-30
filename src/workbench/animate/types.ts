import { VectorLike, VectorLikes } from '@use-gpu/core';

export type Ease = 'cosine' | 'linear' | 'zero' | 'auto' | 'bezier';

export type Tracks = Record<string, Keyframe<any>[]>;

export type Keyframe<T extends number | VectorLike | VectorLikes = number | VectorLike | VectorLikes> =
| [
  number,
  T,
]
| [
  number,
  T,
  Ease,
]
| [
  number,
  T,
  Ease,
  [number, number] | null | undefined,
  [number, number] | null | undefined,
]
| [
  number,
  T,
  Ease,
  [number, number] | null | undefined,
  [number, number] | null | undefined,
  T | null | undefined,
  T | null | undefined,
];
