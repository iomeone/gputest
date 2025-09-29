import type { Rectangle, Point4 } from '@use-gpu/core';
import type { ParsedEffect } from './types';
import { SLIDE_EFFECTS } from './traits';

import { useContext, useMemo, useOne, useRef, useFiber } from '@use-gpu/live';
import { bundleToAttributes } from '@use-gpu/shader/wgsl';
import { useTimeContext, LoopContext, useBoundSource, useBoundShader, useShaderRef } from '@use-gpu/workbench';
import { usePresentContext } from './providers/present-provider';

import { getSlideMask } from '@use-gpu/wgsl/present/mask.wgsl';
import { getSlideMotion } from '@use-gpu/wgsl/present/motion.wgsl';

const ATTRIBUTES = bundleToAttributes(getSlideMotion);
const NO_VEC4: Point4 = [0, 0, 0, 0];
const EPSILON = 1e-3;

const π = Math.PI;
const τ = π*2;

const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const lerp = (a: number, b: number, t: number) => a * (1 - t) + b * t;

type Sampler = (t: number) => number;

// GPU-rendered slide transition
export const usePresentTransition = (
  id: number,
  layout: Rectangle,
  enter: ParsedEffect,
  exit: ParsedEffect,
  initial?: number,
) => {
  const e = useRef(0);
  const d = useRef<Point4>(NO_VEC4);
  const v = useRef(0);
  const l = useShaderRef(layout);

  const es = useBoundSource(ATTRIBUTES[0], e);
  const ds = useBoundSource(ATTRIBUTES[1], d);
  const vs = useBoundSource(ATTRIBUTES[2], v);

  const mask = useBoundShader(getSlideMask, [es, ds, vs]);
  const transform = useBoundShader(getSlideMotion, [es, ds, vs, l]);

  const useUpdateTransition = () => {
    const {useTransition, isVisible} = usePresentContext();

    const value = useTransition(id, enter, exit, initial);
    v.current = value;

    const isEnter = value <= 0;
    useOne(() => {
      const fx = isEnter ? enter : exit;
      const {type, direction} = fx;
      const index = SLIDE_EFFECTS.indexOf(type!) || 0;

      e.current = index;
      d.current = direction;
    }, isEnter);

    return isVisible(id);
  };

  return {mask, transform, useUpdateTransition};
};

// CPU-side animator for a transition.
//
// Animates a value between [-1, 0, 1] for entering vs exiting,
// either of which can happen in reverse.
//
// The animated value scrubs linearly left or right, and smoothly adapts or reverses if interrupted.
// Easing is applied last, acting between the [-1, 0] and [0, 1] points.
export const makeUseTransition = (
  getVisibleState: (id: number) => number | null,
) => (
  id: number,
  enter: ParsedEffect,
  exit: ParsedEffect,
  initial?: number,
): number => {
  const target = getVisibleState(id);
  const timer = useTimeContext();

  const timeRef = useRef<number | null>(null);
  const samplerRef = useRef<Sampler | null>(null);

  const valueRef = useRef<number>(initial ?? target);
  const {request} = useContext(LoopContext);

  return useMemo(() => {
    // Animate in relative time
    const {delta} = timer;
    const {current: value} = valueRef;

    // Determine whether entering or exiting
    const active = ((target ?? 0) + (value ?? 0)) / 2 < 0 ? enter : exit;
    const {duration, delay} = active;

    // Trigger animation if target changes
    if (target !== value) {
      if (value != null) {
        let boost = 0;
        let from = value;
        let to = target;

        // Sample ongoing transition to determine velocity boost
        const {current: time} = timeRef;
        const {current: sampler} = samplerRef;
        if (time != null && sampler != null && from != null && to != null) {
          from = sampler(time);

          // Boost correction is relative to linear interpolation from A to B
          // because easing is applied after sampling
          const slope = (sampler(time + EPSILON) - from) / EPSILON;
          boost = slope - (to - from) / duration;
        }

        samplerRef.current = makeSampler(from, to ?? from, boost, duration, delay);
        timeRef.current = 0;
      }
      valueRef.current = target;
    }

    const {current: time} = timeRef;
    const {current: sampler} = samplerRef;

    if (time != null) timeRef.current! += delta / 1000;
    if (time == null || sampler == null) return valueRef.current ?? -1;

    const fiber = useFiber();
    if (time < delay + duration) request(fiber);

    let offset = sampler(time);
    const {ease} = offset < 0 ? enter : exit;
    if (ease === 'cosine') offset = cosineEase(offset);

    return offset;
  }, [timer, target]);
};

// Linear sampler with non-linear interruption boost to continue the existing motion.
const makeSampler = (
  from: number,
  to: number,
  boost: number,
  duration: number,
  delay: number,
) => (
  time: number,
) => {
  let t = clamp((time - delay) / duration, 0, 1);

  let f = lerp(from, to, t);
  if (boost) {
    let i = clamp(time / duration, 0, 1);
    f += boost * duration * i * (1 - i) * (1 - i);
  }

  return f;
};

const cosineEase = (t: number) => t - Math.sin(t * τ) / τ;
