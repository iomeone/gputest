import type { LC, LiveElement } from '../../live';
import type { MouseState } from '../../workbench';

import { useVersion } from '../../live';
import { useRenderProp, useMouseState } from '../../workbench';

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
