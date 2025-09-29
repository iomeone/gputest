import type { LC } from '../live';

import { useContext, useOne } from '../live';
import { KeyboardContext } from '../workbench';
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
