import type { LC } from '@use-gpu/live';

import { useContext, useOne } from '@use-gpu/live';
import { KeyboardContext } from '@use-gpu/workbench';
import { usePresentContext } from './providers/present-provider';

export type KeyboardControlsProps = {
  _unused?: null,
};

export const KeyboardControls: LC<KeyboardControlsProps> = (props: KeyboardControlsProps) => {
  const {keyboard} = useContext(KeyboardContext);
  const api = usePresentContext();

  useOne(() => {
    const {keys: {arrowLeft, arrowRight, arrowUp, arrowDown}} = keyboard;
    if (arrowRight || arrowDown) {
      api.goForward();
    }
    if (arrowLeft || arrowUp) {
      api.goBack();
    }
  }, keyboard);

  return null;
};
