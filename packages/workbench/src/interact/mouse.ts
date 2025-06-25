import type { LC, LiveElement } from '@use-gpu/live';
import type { MouseState } from './types';

import { useVersion } from '@use-gpu/live';
import { useRenderProp } from '../hooks/useRenderProp';
import { useMouseState } from '../providers/event-provider';

export type MouseProps = {
  move?: boolean,
  render?: (state: MouseState) => LiveElement,
  children?: (state: MouseState) => LiveElement,
};

export const Mouse: LC<MouseProps> = (props: MouseProps) => {
  const {move} = props;
  const mouse = useMouseState();

  const v = useVersion(mouse.x + mouse.y);
  if (move && v === 1) return null;

  return useRenderProp(props, mouse);
};
