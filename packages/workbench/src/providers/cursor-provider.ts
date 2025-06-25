import type { LiveComponent, LiveElement } from '@use-gpu/live';

import { capture, makeCapture, useOne } from '@use-gpu/live';

export const CursorState = makeCapture<string>('CursorState');

export type CursorProviderProps = {
  element: HTMLElement,
  children?: LiveElement,
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
