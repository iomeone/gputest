import type { Rectangle, XYZW } from '@use-gpu/core';
import type { ParsedEffect } from './types';
import { SLIDE_EFFECTS } from './traits';

import { clamp, lerp } from '@use-gpu/core';
import { useContext, useMemo, useOne, useRef, useFiber } from '@use-gpu/live';
import { bundleToAttributes } from '@use-gpu/shader/wgsl';
import { useTimeContext, LoopContext, useSource, useShader, useShaderRef } from '@use-gpu/workbench';
import { usePresentContext } from './providers/present-provider';

import { getSlideMask } from '@use-gpu/wgsl/present/mask.wgsl';
import { getSlideMotion } from '@use-gpu/wgsl/present/motion.wgsl';

const ATTRIBUTES = bundleToAttributes(getSlideMotion);
const NO_VEC4: XYZW = [0, 0, 0, 0];
const EPSILON = 1e-3;

const π = Math.PI;
const τ = π*2;

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
  const d = useRef<XYZW>(NO_VEC4);
  const v = useRef(0);
  const l = useShaderRef(layout);

  const es = useSource(ATTRIBUTES[0], e);
  const ds = useSource(ATTRIBUTES[1], d);
  const vs = useSource(ATTRIBUTES[2], v);

  const mask = useShader(getSlideMask, [es, ds, vs]);
  const transform = useShader(getSlideMotion, [es, ds, vs, l]);

  const useUpdateTransition = () => {
    const {useTransition, isVisible} = usePresentContext();

    const value = useTransition(id, enter, exit, initial);
    v.current = value;

    const isEnter = value <= 0;
    useOne(() => {
      const fx = isEnter ? enter : exit;
      const {type, direction} = fx;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
        const to = target;

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

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (time != null) timeRef.current! += delta / 1000;
    if (time == null || sampler == null) return valueRef.current ?? -1;

    const fiber = useFiber();
    if (time < delay + duration) request(fiber);
    else samplerRef.current = null;

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
  const t = clamp((time - delay) / duration, 0, 1);

  let f = lerp(from, to, t);
  if (boost) {
    const i = clamp(time / duration, 0, 1);
    f += boost * duration * i * (1 - i) * (1 - i);
  }

  return f;
};

const cosineEase = (t: number) => t - Math.sin(t * τ) / τ;
