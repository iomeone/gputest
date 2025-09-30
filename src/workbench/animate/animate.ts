import type { LC, LiveElement } from '@use-gpu/live';
import type { VectorLike, VectorLikes } from '@use-gpu/core';
import type { Keyframe, Lerpable, LerpableRecord, Tracks } from './types';

import { clamp, lerp } from '@use-gpu/core';
import { extend, mutate, fence, useCallback, useDouble, useMemo, useOne } from '@use-gpu/live';
import { useTimeContext } from '../providers/time-provider';
import { useAnimationFrame, useNoAnimationFrame } from '../providers/loop-provider';
import { getRenderFunc } from '../hooks/useRenderProp';

import { makeValueRef, interpolateValue } from './interpolate';

import mapValues from 'lodash/mapValues.js';
import zipObject from 'lodash/zipObject.js';

const π = Math.PI;

export type AnimateProps<T extends Lerpable | LerpableRecord> = {
  tracks?: T extends LerpableRecord ? Tracks<T> : never,
  keyframes?: T extends Lerpable ? Keyframe<T>[] : never,
  prop?: T extends Lerpable ? string : never,

  loop?: boolean,
  mirror?: boolean,
  repeat?: number,
  ease?: 'cosine' | 'linear' | 'bezier',

  delay?: number,
  rest?: number,
  duration?: number,
  speed?: number,

  paused?: boolean,

  render?: (value: T) => LiveElement,
  children?: LiveElement | ((value: T) => LiveElement),
};

export const Animate: LC<AnimateProps<any>> = <T extends Lerpable | LerpableRecord>(props: AnimateProps<T>) => {
  const {
    loop = false,
    mirror = false,
    repeat = Infinity,
    ease = 'cosine',

    delay = 0,
    rest = 0,
    speed = 1,
    paused = false,
    duration = null,

    tracks,
    keyframes,
    prop = 'value',

    children,
  } = props;

  const script = useMemo(() => (
    tracks ??
    (keyframes ? {[prop]: keyframes} : null)
  ), [tracks, keyframes, prop]);
  if (!script) return null;

  const startedRef = useOne(() => ({current: -1}), script);
  const timeRef = useOne(() => ({current: 0}), script);

  const length = useMemo(() => {
    if (duration != null) return duration;
    const tracks = Array.from(Object.values(script));
    return tracks.reduce((length, keyframes) => Math.max(length, keyframes[keyframes.length - 1][0]), 0)
  }, [script, duration]);

  const render = getRenderFunc(props);

  // To avoid garbage collection, make a double-buffered value object with copies of all values
  const [swapValues] = useDouble(() => mapValues(script, keyframes => makeValueRef(keyframes[0][1])), Object.keys(script));

  // If rendering JSX children, optimize this too
  const [swapElements] = useDouble(() => children && !render ? extend(children, swapValues()) : null, [children, swapValues]);

  // But scalars can't be passed by reference, so track them
  const scalars = zipObject(Object.keys(script).filter(k => typeof script[k][0][1] === 'number'));

  const Run = useCallback(() => {
    const {elapsed, delta, start} = useTimeContext();

    // Reset internal clock if external loop was interrupted
    if (start !== startedRef.current) {
      startedRef.current = start;
      timeRef.current = elapsed;
    }
    else if (!paused) {
      timeRef.current += delta * speed;
    }

    const time = Math.max(0, timeRef.current / 1000 - delay);
    const [t, max] = getLoopedTime(time, length, rest, loop ? repeat : 0, mirror);

    const values = swapValues();
    for (const k in values) evaluateKeyframe(values, k, script[k], t, ease);

    // Run if not paused or not past end
    if (!paused && time < max) useAnimationFrame();
    else useNoAnimationFrame();

    if (render) return tracks ? render(values as T) : render(values[prop] as T);
    else if (typeof children === 'object') {
      const elements = swapElements();
      for (const k in scalars) scalars[k] = values[k];
      mutate(elements, scalars);
      return elements;
    }

    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [script, swapValues, swapElements, delay, rest, length, speed, loop, mirror, repeat, ease, paused, render, children]);

  // Fence so that only continuation runs repeatedly
  return fence(null, Run);
};

const evaluateKeyframe = <T extends number | VectorLike | VectorLikes>(
  values: Record<string, T>,
  prop: string,
  keyframes: Keyframe<T>[],
  time: number,
  ease: string,
) => {
  const i = getActiveKeyframe(keyframes, time);
  const a = keyframes[i];
  const b = keyframes[i + 1] ?? a;

  const [start] = a;
  const [end] = b;
  const dt = end - start;

  let fraction = clamp(dt ? (time - start) / dt : 0, 0, 1);

  if (ease === 'bezier') {
    interpolateValue(values as any, prop, a[1] as any, b[1] as any, fraction, lerp);
    //value = interpolateValueBezier(a[1], b[1], a[2], a[3], b[2], b[3], r);
  }
  else {
    if (ease === 'cosine') fraction = .5 - Math.cos(fraction * π) * .5;
    interpolateValue(values as any, prop, a[1] as any, b[1] as any, fraction, lerp);
  }
};

const getActiveKeyframe = <T extends number | VectorLike | VectorLikes>(keyframes: Keyframe<T>[], time: number) => {
  const n = keyframes.length;
  let i = 0;
  for (; i < n - 2; ++i) {
    if (time < keyframes[i + 1][0]) break;
  }
  return i;
};

const getLoopedTime = (time: number, duration: number, rest: number, repeat: number, mirror: boolean) => {
  const max = (duration + rest) * repeat + duration;
  let t = Math.min(max, time);

  const dp = duration + rest;
  if (mirror) {
    t = time % (dp * 2);
    if (t < dp) t = Math.min(duration, t);
    else t = duration - Math.min(duration, t - dp);
  }
  else {
    t = Math.min(duration, time % dp);
  }

  return [t, max];
}
