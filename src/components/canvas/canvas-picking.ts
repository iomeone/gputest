import { LiveComponent, LiveElement } from '../../live/types';

import { Picking } from '../render/picking';
import { EventProvider } from '../providers/event-provider';
import { DOMEvents } from './dom-events';

import { use } from '../../live';

export type CanvasPickingProps = {
  canvas: HTMLCanvasElement,
  children: LiveElement<any>,
}

export const CanvasPicking: LiveComponent<CanvasPickingProps> = ({ canvas, children }) =>
  use(Picking, {
    children:

      use(DOMEvents, {
        element: canvas,
        children,
      })

  })
