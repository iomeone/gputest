import { LiveComponent, LiveElement, DeferredCall } from '@use-gpu/live/types';
import { TypedArray } from '@use-gpu/core/types';

import { useOne } from '@use-gpu/live';
import { useTimeContext } from '../providers/time-provider';
import { useAnimationFrame, useNoAnimationFrame } from '../providers/loop-provider';

type Ease = 'cosine' | 'linear' | 'zero' | 'auto' | 'bezier';

type Keyframe = [
  number,
  T,
  Ease,
  [number, number] | null | undefined,
  [number, number] | null | undefined,
  T | null | undefined,
  T | null | undefined,
];

export type AnimationProps<T> = {
  loop?: boolean,
  mirror?: boolean,
  repeat?: number,
  ease?: 'cosine' | 'linear' | 'bezier',

  delay?: number,
  pause?: number,
  frames?: Keyframe[],

  prop?: string,
  children?: LiveElement<any>,
  render?: (value: T) => LiveElement<any>,
};

const getActiveFrames = (frames: Keyframe[], time: number) => {
  const n = frames.length;
  let i = 0;
  for (; i < n - 1; ++i) {
    if (time < frames[i + 1][0]) break;
  }
  return [frames[i], frames[i + 1]];
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

type Arg = T | T[] | TypedArray;

const interpolateValue = <T>(a: Arg<T>, b: Arg<T>, t: number) => {
  if (a === +a && b === +b) {
    return a * (1 - t) + b * t;
  }
  if (a.length != null && b.length !== null) {
    let aa = a as T[];
    let bb = b as T[];
    let n = Math.min(aa.length, bb.length);
    let out: T[] = [];
    for (let i = 0; i < n; ++i) out.push(interpolateValue(a[i], b[i], t));
    return out;
  }
  return a;
};

const injectProp = (prop: string, value: any) => (call: DeferredCall<any>) => {
  if (call.args) {
    const [props] = call.args;
    if (props) {
      call.args = [{
        ...props,
        [prop]: value,
      }];
    }
  }
  return call;
};

export const Animation: LiveComponent<AnimationProps<unknown>> = <T>(props: AnimationProps<T>) => {
  const {
    loop = false,
    mirror = false,
    repeat = Infinity,
    ease = 'cosine',

    delay = 0,
    pause = 0,
    frames,

    prop,
    render,
    children,
  } = props;

  const {
    timestamp,
    elapsed,
    delta,
  } = useTimeContext();

  if (!frames) return;

  const started = useOne(() => elapsed, frames);
  const duration = useOne(() => frames[frames.length - 1][0], frames);

  let time = Math.max(0, (elapsed - started) / 1000 - delay);
  let [t, max] = getLoopedTime(time, duration, pause, repeat, mirror);

  const [a, b] = getActiveFrames(frames, t);
  const [start] = a;
  const [end] = b;

  const dt = end - start;

  let r = Math.max(0, Math.min(1, dt ? (t - start) / dt : 0));

  let value: T | null = null;

  if (ease === 'bezier') {
    value = interpolateValue(a[1], b[1],  r);
    //value = interpolateValueBezier(a[1], b[1], a[2], a[3], b[2], b[3], r);
  }
  else {
    if (ease === 'cosine') r = .5 - Math.cos(r * Math.PI) * .5;
    value = interpolateValue(a[1], b[1],  r);
  }

  if (time < max) useAnimationFrame();
  else useNoAnimationFrame();

  if (value == null) return null;
  if (render) return render(value);
  if (children && prop) {
    const list = children.f ? [children] : children.slice();
    list.map(injectProp(prop, value));
    return list;
  }
  return children;
};
