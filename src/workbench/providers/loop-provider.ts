import type { LiveFiber } from '@use-gpu/live';
import { makeContext, useContext, useFiber, useNoContext } from '@use-gpu/live';
import { TimeContext, TimeContextProps } from './time-provider';

type LoopContextProps = {
  buffered: boolean,
  request: (fiber?: LiveFiber<any>) => TimeContextProps,
};

export const LoopContext = makeContext<LoopContextProps>({
  buffered: false,
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  request: () => TimeContext.initialValue!,
}, 'LoopContext');

export const useAnimationFrame   = () => useContext(LoopContext).request(useFiber());
export const useNoAnimationFrame = () => useNoContext(LoopContext);
