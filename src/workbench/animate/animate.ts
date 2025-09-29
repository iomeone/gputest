import type { LiveComponent, LiveElement, DeferredCall, PropsWithChildren } from '@use-gpu/live';
import type { TypedArray } from '@use-gpu/core';
import type { Keyframe } from './types';

import { use, extend, fence, useMemo, useOne, useRef } from '@use-gpu/live';
import { useTimeContext } from '../providers/time-provider';
import { useAnimationFrame, useNoAnimationFrame } from '../providers/loop-provider';

import mapValues from 'lodash/mapValues';

export type AnimateProps<T> = {
  loop?: boolean,
  mirror?: boolean,
  repeat?: number,
  ease?: 'ease' | 'cosine' | 'linear' | 'bezier',

  delay?: number,
  pause?: number,
  duration?: number,
  speed?: number,

  tracks?: Record<string, Keyframe<T>[]>,
  keyframes?: Keyframe<T>[],
  prop?: string,

  render?: (value: any) => LiveElement,
};

const evaluateKeyframes = <T>(keyframes: Keyframe<T>[], time: number, ease: string) => {
  let [a, b] = getActiveKeyframes(keyframes, time);
  if (!b) b = a;

  const [start] = a;
  const [end] = b;

  const dt = end - start;

  let r = Math.max(0, Math.min(1, dt ? (time - start) / dt : 0));

  let value: any = null;

  if (ease === 'bezier') {
    value = interpolateValue(a[1] as any, b[1] as any, r);
    //value = interpolateValueBezier(a[1], b[1], a[2], a[3], b[2], b[3], r);
  }
  else {
    if (ease === 'cosine') r = .5 - Math.cos(r * Math.PI) * .5;
    value = interpolateValue(a[1] as any, b[1] as any, r);
  }

  return value;
};

const getActiveKeyframes = <T>(keyframes: Keyframe<T>[], time: number) => {
  const n = keyframes.length;
  let i = 0;
  for (; i < n - 2; ++i) {
    if (time < keyframes[i + 1][0]) break;
  }
  return [keyframes[i], keyframes[i + 1]];
};

const getLoopedTime = (time: number, duration: number, pause: number, repeat: number, mirror: boolean) => {
  const max = duration * (repeat + 1);
  let t = Math.min(max, time);

  let dp = duration + pause;
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

interface Interpolator {
  (a: number, b: number, t: number): number,
  <T extends Array<any>>(a: T, b: T, t: number): T,
  (a: TypedArray, b: TypedArray, t: number): number[],
};

const interpolateValue: Interpolator = <T>(a: any, b: any, t: number) => {
  if (a === +a && b === +b) {
    return (a * (1 - t) + b * t) as any as T;
  }
  if (a.length != null && b.length !== null) {
    let aa = a as T[];
    let bb = b as T[];
    let n = Math.min(aa.length, bb.length);
    let out: T[] = [];
    for (let i = 0; i < n; ++i) out.push(interpolateValue(aa[i] as any, bb[i] as any, t));
    return out;
  }
  return a;
};

// causes typescript docgen to crash if defined as recursive
type NestedNumberArray = any[];
type Numberish = number | TypedArray | NestedNumberArray;

export const Animate: LiveComponent<AnimateProps<Numberish>> = <T extends Numberish>(props: PropsWithChildren<AnimateProps<T>>) => {
  const {
    loop = false,
    mirror = false,
    repeat = Infinity,
    ease = 'cosine',

    delay = 0,
    pause = 0,
    speed = 1,
    duration = null,

    tracks,
    keyframes,
    prop,

    render,
    children,
  } = props;

  const script = useMemo(() => (
    tracks ??
    ((keyframes && prop) ? {[prop]: keyframes} : null)
  ), [tracks, keyframes, prop]);
  if (!script) return null;

  const startedRef = useOne(() => ({current: -1}), script);
  const length = useMemo(() => {
    if (duration) return duration;
    const tracks = Array.from(Object.values(script));
    return tracks.reduce((length, keyframes) => Math.max(length, keyframes[keyframes.length - 1][0]), 0)
  }, [script, duration]);

  const Run = useMemo(() => {
    let props1 = mapValues(script, () => null);
    let props2 = mapValues(script, () => null);
    let flip = false;

    return () => {
      const {
        timestamp,
        elapsed,
        delta,
      } = useTimeContext();

      let {current: started} = startedRef;
      if (started < 0) started = startedRef.current = elapsed;

      flip = !flip;
      const props = flip ? props1 : props2;

      const time = Math.max(0, (elapsed - started) / 1000 - delay) * speed;
      const [t, max] = getLoopedTime(time, length, pause, repeat, mirror);

      for (let k in props) props[k] = evaluateKeyframes(script[k], t, ease);

      if (time < max) useAnimationFrame();
      else useNoAnimationFrame();

      if (render) return tracks ? render(props) : (prop ? render(props[prop]) : null);
      if (children) return extend(children, props);

      return (children as any) ?? null;
    };
  }, [script, length, render, children]);

  // Fence so that continuation can change closure state
  return fence(null, Run);
};
