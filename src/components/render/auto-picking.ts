import { LiveComponent, LiveElement } from '../../live/types';

import { Picking } from './picking';
import { EventProvider } from '../providers/event-provider';

import { use } from '../../live';

export type AutoPickingProps = {
  canvas: HTMLCanvasElement,
  children: LiveElement<any>,
}

export const AutoPicking: LiveComponent<AutoPickingProps> = ({ canvas, children }) =>
  use(Picking)({
    children:

      use(EventProvider)({
        element: canvas,
        children,
      })
  })
