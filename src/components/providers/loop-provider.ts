import { LiveFiber } from '@use-gpu/live/types';
import { makeContext, useContext, useFiber, useNoContext } from '@use-gpu/live';

type LoopContextProps = {
  current: number,
};

export const LoopContext = makeContext<LoopContextProps>({
  request: () => {},
}, 'LoopContext');

export const useAnimationFrame   = () => useContext(LoopContext).request(useFiber());
export const useNoAnimationFrame = () => useNoContext(LoopContext);
