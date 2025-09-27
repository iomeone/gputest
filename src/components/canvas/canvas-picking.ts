import { LiveComponent, LiveElement } from '@use-gpu/live/types';

import { Picking } from '../render/picking';
import { EventProvider } from '../providers/event-provider';
import { DOMEvents } from './dom-events';

import { use } from '@use-gpu/live';

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
