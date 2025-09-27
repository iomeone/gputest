import type { LiveFiber, LiveComponent, LiveElement, LiveMap } from '@use-gpu/live';

import { memo, capture, makeCapture, useCapture, useOne, useMemo, captureTail } from '@use-gpu/live';

export const CursorState = makeCapture('CursorState');

export type CursorProps = {
  cursor?: string,
};

export type CursorProviderProps = {
  element: HTMLElement,
  children: LiveElement<any>,
};

export const CursorProvider: LiveComponent<CursorProviderProps> = (props) => {
  const {element, children} = props;
  
  const Resume = useOne(() => 
    (map: LiveMap<string>) => {
      const cursor = captureTail(map) ?? 'default';
      if (element.style.cursor !== cursor) element.style.cursor = cursor;
    },
    element);

  return capture(CursorState, children, Resume);
};

export const Cursor: LiveComponent<CursorProps> = memo((props: CursorProps) => {
  useCapture(CursorState, props.cursor);
  return null;
}, 'Cursor');
