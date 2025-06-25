import type { LC, LiveElement } from '@use-gpu/live';
import type { KeyboardState } from './types';

import { useRenderProp } from '../hooks/useRenderProp';
import { useKeyboardState } from '../providers/event-provider';

export type KeyboardProps = {
  render?: (state: KeyboardState) => LiveElement,
  children?: (state: KeyboardState) => LiveElement,
};

export const Keyboard: LC<KeyboardProps> = (props: KeyboardProps) => {
  const keyboard = useKeyboardState();
  return useRenderProp(props, keyboard);
};
