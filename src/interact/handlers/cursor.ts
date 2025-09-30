import type { LC } from '../../live';

import { memo, useCapture } from '../../live';
import { CursorState } from '../../workbench';

export type CursorProps = {
  cursor?: string,
};

export const Cursor: LC<CursorProps> = memo((props: CursorProps) => {
  useCapture(CursorState, props.cursor);
  return null;
}, 'Cursor');
