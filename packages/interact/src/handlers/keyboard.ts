import type { LC, LiveElement } from '@use-gpu/live';
import type { KeyboardState } from '@use-gpu/workbench';

import { useRenderProp, useKeyboardState } from '@use-gpu/workbench';

export type KeyboardProps = {
  render?: (state: KeyboardState) => LiveElement,
  children?: (state: KeyboardState) => LiveElement,
};

export const Keyboard: LC<KeyboardProps> = (props: KeyboardProps) => {
  const keyboard = useKeyboardState();
  return useRenderProp(props, keyboard);
};
