import type { LC, LiveElement } from '@use-gpu/live';
import type { TypedArray, VectorLike, VectorLikes } from '@use-gpu/core';
import type { Keyframe } from './types';

import { clamp } from '@use-gpu/core';
import { extend, mutate, fence, useCallback, useDouble, useMemo, useOne } from '@use-gpu/live';
import { useTimeContext } from '../providers/time-provider';
import { useAnimationFrame, useNoAnimationFrame } from '../providers/loop-provider';
import { getRenderFunc } from '../hooks/useRenderProp';

import { makeValueRef, interpolateValue } from './interpolate';

import mapValues from 'lodash/mapValues.js';
import zipObject from 'lodash/zipObject.js';

export type EaseToTargetProps<T extends number | VectorLike | VectorLikes> = {
  ease?: 'exp' | 'exp2',

  duration?: number,
  speed?: number,
  paused?: boolean,

  values?: Record<string, T>,

  render?: (values: Record<string, T>) => LiveElement,
  children?: LiveElement | ((values: Record<string, T>) => LiveElement),
};

// causes typescript docgen to crash if defined as recursive
type NestedNumberArray = any[];
type Numberish = number | TypedArray | NestedNumberArray;

export const EaseToTarget: LC<EaseToTargetProps<Numberish>> = <T extends Numberish>(props: AnimateProps<T>) => {
  const {
    ease = 'exp2',
    duration = 1000,
    speed = 1,
    paused = false,

    values,

    children,
  } = props;

  const render = getRenderFunc(props);

  // To avoid garbage collection, make a double-buffered value object with copies of all values
  const [swapValues] = useDouble(() => mapValues(values, v => makeValueRef(v)), Object.keys(values));

  // If rendering JSX children, optimize this too
  const [swapElements] = useDouble(() => children && !render ? extend(children, swapValues()) : null, [children, swapValues]);

  // But scalars can't be passed by reference, so track them
  const scalars = zipObject(Object.keys(values).filter(k => typeof values[k] === 'number'));

  const Run = useCallback(() => {
    const {delta} = useTimeContext();

    const values = swapValues();
    for (const k in values) evaluateKeyframe(values, k, script[k], t, ease);

    // Run if not paused or not past end
    if (!paused && time < max) useAnimationFrame();
    else useNoAnimationFrame();

    if (render) return tracks ? render(values) : (prop ? render(values[prop]) : null);
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
