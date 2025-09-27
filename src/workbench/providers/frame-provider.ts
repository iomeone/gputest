import { makeContext, useContext, useNoContext } from '@use-gpu/live';

export type FrameContextProps = {
  current: number,
};

export const FrameContext = makeContext<FrameContextProps>({
  current: 0,
}, 'FrameContext');

export const usePerFrame   = () => useContext(FrameContext);
export const useNoPerFrame = () => useNoContext(FrameContext);
