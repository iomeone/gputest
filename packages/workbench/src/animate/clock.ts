import type { LC, LiveElement } from '@use-gpu/live';

import { extend, mutate, fence, useCallback, useDouble, useMemo, useOne } from '@use-gpu/live';
import { useTimeContext } from '../providers/time-provider';
import { useAnimationFrame, useNoAnimationFrame } from '../providers/loop-provider';
import { getRenderFunc } from '../hooks/useRenderProp';

export type ClockProps = {
  prop?: string,

  start?: number,
  speed?: number,
  paused?: boolean,

  render?: (value: any) => LiveElement,
  children?: LiveElement | ((value: any) => LiveElement),
};

export const Clock: LC<ClockProps> = (props: ClockProps) => {
  const {
    start,
    speed = 1,
    paused = false,
    prop = "timestamp",

    children,
  } = props;

  const render = getRenderFunc(props);
  const [swapValues] = useDouble(() => ({[prop]: 0}), [prop]);
  const [swapElements] = useDouble(() => children && !render ? extend(children, swapValues()) : null, [children, swapValues]);

  const timeRef = useOne(() => ({current: start ?? +new Date()}), start);

  const Run = useCallback(() => {
    const {delta} = useTimeContext();
    if (!paused) {
      timeRef.current += delta * speed;
    }

    const values = swapValues();
    values[prop] = timeRef.current / 1000;

    // Run if not paused
    if (!paused) useAnimationFrame();
    else useNoAnimationFrame();

    if (render) return (prop ? render(values[prop]) : null);
    else if (typeof children === 'object') {
      const elements = swapElements();
      mutate(elements, values);
      return elements;
    }

    return null;
  }, [prop, swapValues, swapElements, speed, render, children]);

  // Fence so that only continuation runs repeatedly
  return fence(null, Run);
};
