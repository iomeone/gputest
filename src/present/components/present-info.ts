import type { LC, LiveElement } from '@use-gpu/live';

import { usePresentContext } from '../providers/present-provider';

export type PresentInfoProps = {
  children?: (step: number, length: number) => LiveElement,
};

export const PresentInfo: LC<PresentInfoProps> = (props: PresentInfoProps) => {
  const {children} = props;
  const {state: {step, length}} = usePresentContext();

  return children?.(step + 1, length + 1);
};
