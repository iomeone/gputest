import type { LC, LiveElement } from '@use-gpu/live';
import type { TypedArray, VectorLike, VectorLikes } from '@use-gpu/core';

import { seq } from '@use-gpu/core';
import { extend, mutate, fence, useCallback, useDouble, useMemo, useRef } from '@use-gpu/live';
import { useTimeContext } from '../providers/time-provider';
import { useAnimationFrame, useNoAnimationFrame } from '../providers/loop-provider';
import { getRenderFunc } from '../hooks/useRenderProp';

import { makeValueRef, interpolateValue, distanceValue, copyValue } from './interpolate';

import mapValues from 'lodash/mapValues.js';
import zipObject from 'lodash/zipObject.js';

export type EaseToTargetProps<T extends Record<string, number | VectorLike | VectorLikes>> = {
  smooth?: number,

  duration?: number,
  speed?: number,
  paused?: boolean,
  epsilon?: number,

  values: T,
  version?: number,

  render?: (values: T) => LiveElement,
  children?: LiveElement | ((values: T) => LiveElement),
};

// causes typescript docgen to crash if defined as recursive
type NestedNumberArray = any[];
type Numberish = number | TypedArray | NestedNumberArray;

export const EaseToTarget: LC<EaseToTargetProps<Record<string, Numberish>>> = <T extends Record<string, Numberish>>(
  props: EaseToTargetProps<T>
) => {
  const {
    smooth = 1,

    duration = 0.1,
    speed = 1,
    paused = false,
    epsilon = 1e-3,

    values: target,
    version = 0,

    children,
  } = props;

  const render = getRenderFunc(props);
  
  // To avoid garbage collection, make a double-buffered value object with copies of all values
  const keys = Object.keys(target);
  const [swapValues] = useDouble(() => mapValues(target, v => makeValueRef(v)), keys);

  // If rendering JSX children, optimize this too
  const [swapElements] = useDouble(() => children && !render ? extend(children, swapValues()) : null, [children, swapValues]);

  // Track current values + intermediates
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const trackedValues = useMemo(() => seq(smooth).map(() => mapValues(target, v => makeValueRef(v))), [smooth, swapValues, version]);

  // But scalars can't be passed by reference, so track them
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const scalars = useMemo(() => zipObject(keys.filter(k => typeof target[k] === 'number')), keys);

  // Pass new target by ref
  const targetRef = useRef(target);
  targetRef.current = target;
  
  // Static continuation callback
  const Run = useCallback(() => {
    const {delta} = useTimeContext();
    const current = swapValues();
    const {current: target} = targetRef;

    // Track max distance
    let maxDistance = 0;
    for (const k in current) {
      const d = distanceValue(current[k], target[k]);
      maxDistance = Math.max(maxDistance, d);
    }

    const finished = delta && (maxDistance < epsilon);

    // Interpolate values
    if (!finished) {
      if (delta) {
        const fraction = 1 - Math.pow(2, -delta / 1000 / duration);

        for (const k in current) {
          for (let i = 0; i < smooth; ++i) {
            const a = trackedValues[i - 1] ?? target;
            const b = trackedValues[i];
            interpolateValue(b, k, b[k], a[k], fraction);
          }
          copyValue(current, k, trackedValues[smooth - 1][k]);
        }
      }
    }
    // Snap to target for clean exit
    else {
      for (const k in current) {
        copyValue(current, k, target[k]);
      }
    }

    // Run if not paused or not converged
    if (!paused && !finished) useAnimationFrame();
    else useNoAnimationFrame();

    if (render) return render(current);
    else if (typeof children === 'object') {
      const elements = swapElements();
      for (const k in scalars) scalars[k] = current[k];
      mutate(elements, scalars);
      return elements;
    }

    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swapValues, swapElements, trackedValues, scalars, duration, speed, smooth, paused, render, children]);

  // Fence so that only continuation runs repeatedly
  return fence(null, Run);
};
