import { LiveComponent, LiveElement } from '@use-gpu/live/types';
import { PickingUniforms } from '@use-gpu/core/types';

import { memo, provide, makeContext, useContext, useMemo, useOne, useResource, useState } from '@use-gpu/live';
import { makeIdAllocator, PICKING_UNIFORMS } from '@use-gpu/core';
import { PickingContext } from '../render/picking';
import { RenderContext } from '../providers/render-provider';

const CAPTURE_EVENT = {capture: true};

export const EventContext = makeContext(undefined, 'EventContext');
export const MouseContext = makeContext(undefined, 'MouseContext');

export type EventProviderProps = {
  element: HTMLElement,
  children: LiveElement<any>,
};

export type MouseState = {
  buttons: { left: boolean, middle: boolean, right: boolean },
  button: 'left' | 'middle' | 'right',
  x: number,
  y: number,
};

export type MouseEventState = MouseState & {
  index: number,
  hovered: boolean,
  pressed: boolean,
  clicks: { left: number, middle: number, right: number },
  presses: { left: number, middle: number, right: number },
  capture: () => void,
  uncapture: () => void,
};

const toButton = (button: number) => {
  if (button === 0) return 'left';
  if (button === 1) return 'middle';
  if (button === 2) return 'right';
  return 'none';
};

const toButtons = (buttons: number) => ({
  left: buttons & 1,
  middle: buttons & 3,
  right: buttons & 2,
});

const makeMouseState = () => ({
  buttons: toButtons(0),
  button: toButton(-1),
  x: 0,
  y: 0,
});

const makeMouseRef = () => ({
  buttons: toButtons(0),
  pressed: { left: false, middle: false, right: false },
  presses: { left: 0, middle: 0, right: 0 },
  clicks:  { left: 0, middle: 0, right: 0 },
});

const makeCaptureRef = () => ({
  current: null,
});

export const EventProvider: LiveComponent<EventProviderProps> = memo(({mouse, children}: EventProviderProps) => {
  const {pixelRatio} = useContext(RenderContext);
  const {sampleTexture} = useContext(PickingContext);
  const [captureId, setCaptureId] = useState<number | null>(null);

  const captureRef = useOne(makeCaptureRef);
  captureRef.current = captureId;

  const allocId = useOne(() => makeIdAllocator<any>());
  const [targetId, targetIndex] = sampleTexture(mouse.x * pixelRatio, mouse.y * pixelRatio);

  const eventApi = useOne(() => ({
    useId: () => useResource((dispose) => {
      const id = allocId.obtain();
      dispose(() => {
        allocId.release(id);
        if (captureRef.current === id) setCaptureId(null);
      });
      return id;
    }),
  }));
  
  const mouseContext = useMemo(() => ({
    mouse,
    captureId,
    targetId,
    targetIndex,
    beginCapture: (id: number) => setCaptureId(id),
    endCapture: () => setCaptureId(null),
    useMouse: (id: number): MouseEventState => {
      const ref = useOne(makeMouseRef);
      const {pressed, presses, clicks, buttons: lastButtons} = ref;
      const {buttons, button} = mouse;

      const index    = targetIndex;
      const captured = captureId === id;
      const hovered  = (captureId == null || captured) && (targetId === id);

      useOne(() => {
        if (hovered) {
          if ((buttons.left)   && !(lastButtons.left))   { presses.left++;   pressed.left   = true; }
          if ((buttons.middle) && !(lastButtons.middle)) { presses.middle++; pressed.middle = true; }
          if ((buttons.right)  && !(lastButtons.right))  { presses.right++;  pressed.right  = true; }

          if (!(buttons.left)   && pressed.left)   { clicks.left++;   pressed.left   = false; }
          if (!(buttons.middle) && pressed.middle) { clicks.middle++; pressed.middle = false; }
          if (!(buttons.right)  && pressed.right)  { clicks.right++;  pressed.right  = false; }
        }
        else {
          if (pressed.left   && !(buttons.left)   && (lastButtons.left))   pressed.left   = false;
          if (pressed.middle && !(buttons.middle) && (lastButtons.middle)) pressed.middle = false;
          if (pressed.right  && !(buttons.right)  && (lastButtons.right))  pressed.right  = false;
        }
        ref.buttons = buttons;
      }, buttons);

      return {...mouse, index, hovered, captured, pressed, presses, clicks};
    },
  }), [mouse, targetId, captureId]);

  return provide(MouseContext, mouseContext,
    provide(EventContext, eventApi, children)
  );
}, 'EventProvider');
