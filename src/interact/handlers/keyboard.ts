import type { LC, LiveElement } from '../../live';
import type { KeyboardState } from '../../workbench';

import { useRenderProp, useKeyboardState } from '../../workbench';

export type KeyboardProps = {
  render?: (state: KeyboardState) => LiveElement,
  children?: (state: KeyboardState) => LiveElement,
};

export const Keyboard: LC<KeyboardProps> = (props: KeyboardProps) => {
  const keyboard = useKeyboardState();
  return useRenderProp(props, keyboard);
};
