import type { LC } from '../../live';

import { useOne } from '../../live';
import { useKeyboardState } from '../../workbench';
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
