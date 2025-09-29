import type { LiveFiber } from '../../live';
import { makeContext, useContext, useFiber, useNoContext } from '../../live';

type LoopContextProps = {
  request: (fiber: LiveFiber<any>) => void,
};

export const LoopContext = makeContext<LoopContextProps>({
  request: () => {},
}, 'LoopContext');

export const useAnimationFrame   = () => useContext(LoopContext).request(useFiber());
export const useNoAnimationFrame = () => useNoContext(LoopContext);
