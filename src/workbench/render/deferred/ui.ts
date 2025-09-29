import type { LiveComponent } from '@use-gpu/live';
import type { VirtualDraw } from '../../pass/types';

import { UIRender } from '../forward/ui';

export type DeferredUIRenderProps = VirtualDraw;

export const DeferredUIRender: LiveComponent<DeferredUIRenderProps> = (props: DeferredUIRenderProps) => {
  return UIRender({...props, mode: 'transparent'});
};
