import type { MouseButton, KeyboardModifier } from '../workbench';

export type ActionBinding = {
  wheel?: boolean,
  button?: MouseButton,
  modifiers?: KeyboardModifier[],
  notModifiers?: KeyboardModifier[],
  exact?: boolean,
};

export type ActionMap = Record<string, ActionBinding[] | null>;
