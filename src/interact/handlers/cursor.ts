import type { LC } from '@use-gpu/live';

import { memo, useCapture } from '@use-gpu/live';
import { CursorState } from '@use-gpu/workbench';

export type CursorProps = {
  cursor?: string,
};

export const Cursor: LC<CursorProps> = memo((props: CursorProps) => {
  useCapture(CursorState, props.cursor);
  return null;
}, 'Cursor');
