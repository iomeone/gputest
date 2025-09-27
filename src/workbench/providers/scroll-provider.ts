import type { LC } from '@use-gpu/live';
import { capture, yeet, makeCapture, useCapture, useFiber } from '@use-gpu/live';

export const ScrollSignal = makeCapture<null>('ScrollSignal');

export const ScrollProvider: LC = (props) => {
  const {children} = props;
  
  return capture(ScrollSignal, children, Resume);
};

const Resume = () => yeet();

export const useScrollSignal = () => useCapture(ScrollSignal, null);