import { makeContext, useContext, useNoContext } from '@use-gpu/live';

export type FrameContextProps = number;

export const FrameContext = makeContext<FrameContextProps>(0, 'FrameContext');

export const usePerFrame   = () => useContext(FrameContext);
export const useNoPerFrame = () => useNoContext(FrameContext);
