import type { LC } from '@use-gpu/live';

import { useOne } from '@use-gpu/live';
import { useKeyboardState } from '@use-gpu/workbench';
import { usePresentContext } from '../providers/present-provider';

export type KeyboardControlsProps = {
  _unused?: null,
};

export const KeyboardControls: LC<KeyboardControlsProps> = () => {
  const keyboard = useKeyboardState();
  const api = usePresentContext();

  useOne(() => {
    const {arrowLeft, arrowRight, arrowUp, arrowDown} = keyboard;
    if (arrowRight || arrowDown) {
      api.goForward();
    }
    if (arrowLeft || arrowUp) {
      api.goBack();
    }
  }, keyboard);

  return null;
};
