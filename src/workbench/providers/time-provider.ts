import type { Time } from '@use-gpu/core';
import { makeContext, useContext, useNoContext } from '@use-gpu/live';

export type TimeContextProps = Time;

export const TimeContext = makeContext<TimeContextProps>({
  timestamp: 0,
  elapsed: 0,
  delta: 0,
}, 'TimeContext');

export const useTimeContext = () => useContext<TimeContextProps>(TimeContext);
export const useNoTimeContext = () => useNoContext(TimeContext);
