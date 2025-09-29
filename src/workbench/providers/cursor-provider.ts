import type { LiveFiber, LiveComponent, LiveElement, LiveMap } from '@use-gpu/live';

import { memo, capture, makeCapture, useCapture, useOne, useMemo } from '@use-gpu/live';

export const CursorState = makeCapture('CursorState');

export type CursorProps = {
  cursor?: string,
};

export type CursorProviderProps = {
  element: HTMLElement,
  children: LiveElement,
};

export const CursorProvider: LiveComponent<CursorProviderProps> = (props) => {
  const {element, children} = props;
  
  const Resume = useOne(() => 
    (cursors: string[]) => {
      const cursor = cursors[cursors.length - 1] ?? 'default';
      if (element.style.cursor !== cursor) element.style.cursor = cursor;
    },
    element);

  return capture(CursorState, children, Resume);
};

export const Cursor: LiveComponent<CursorProps> = memo((props: CursorProps) => {
  useCapture(CursorState, props.cursor);
  return null;
}, 'Cursor');
