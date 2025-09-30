import { VectorLike, VectorLikes } from '../../core';

export type Lerpable = number | VectorLike | VectorLikes;
export type LerpableRecord = Record<string, Lerpable>;

export type Tracks<T extends LerpableRecord> = {
  [K in keyof T]: Keyframe<T[K]>[];
};

export type KeyframeType<T> = T extends Keyframe<infer E> ? E : never;

export type Ease = 'cosine' | 'linear' | 'zero' | 'auto' | 'bezier';

export type Keyframe<T extends Lerpable> =
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
