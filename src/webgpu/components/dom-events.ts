import type { LiveComponent, LiveElement } from '@use-gpu/live';

import { use, memo, useResource, useState } from '@use-gpu/live';
import { EventProvider, MouseState, WheelState, KeyboardState } from '@use-gpu/workbench';//'/providers/event-provider';

const CAPTURE_EVENT = {capture: true};
const NON_PASSIVE_EVENT = {capture: true, passive: false};

const WHEEL_STEP = 120;
const PIXEL_STEP = 10;
const DELTA_MULTIPLIER = [1, 4, 80];

export type DOMEventsProps = {
  element: HTMLElement,
  children: LiveElement<any>,
};

const toButton = (button: number) => {
  if (button === 0) return 'left';
  if (button === 1) return 'middle';
  if (button === 2) return 'right';
  return 'none';
};

const toButtons = (buttons: number) => ({
  left:   !!(buttons & 1),
  middle: !!(buttons & 4),
  right:  !!(buttons & 2),
});

const makeMouseState = () => ({
  buttons: toButtons(0),
  button: toButton(-1),
  x: 0,
  y: 0,
  moveX: 0,
  moveY: 0,
  stopped: false,
} as MouseState);

const makeWheelState = () => ({
  x: 0,
  y: 0,
  moveX: 0,
  moveY: 0,
  spinX: 0,
  spinY: 0,
  stopped: false,
} as WheelState);

const makeKeyboardState = () => ({
  modifiers: {
    ctrl: false,
    alt: false,
    shift: false,
    meta: false,
  },
  stopped: false,
} as KeyboardState);

export const DOMEvents: LiveComponent<DOMEventsProps> = memo(({element, children}: DOMEventsProps) => {
  const [mouse, setMouse] = useState<MouseState>(makeMouseState);
  const [wheel, setWheel] = useState<WheelState>(makeWheelState);
  const [keyboard, setKeyboard] = useState<KeyboardState>(makeKeyboardState);

  useResource((dispose) => {

    const onModifiers = (event: Event) => {
      const e = event as any;
      setKeyboard((state) => {
        if (
          state.modifiers.ctrl === e.ctrlKey &&
          state.modifiers.alt === e.altKey &&
          state.modifiers.shift === e.shiftKey &&
          state.modifiers.meta === e.metaKey
        ) {
          return state;
        }

        return {
          ...state,
          modifiers: {
            ctrl:  e.ctrlKey,
            alt:   e.altKey,
            shift: e.shiftKey,
            meta:  e.metaKey,
          },
          stopped: false,
        };
      });
    };

    // Special Firefox-only event. Prefer if available.
    const onDOMWheel = (e: any) => {
      element.removeEventListener('wheel', onWheel, CAPTURE_EVENT);
      onWheel(e);
    };

    const onWheel = (e: any) => {
      const {
        clientX, clientY,
        deltaMode, deltaX, deltaY,
        detail, axis, HORIZONTAL_AXIS,
        wheelDelta, wheelDeltaX, wheelDeltaY,
      } = (e as any);

      let moveX = 0;
      let moveY = 0;
      let spinX = 0;
      let spinY = 0;

      // Wheel -> Spin
      if ('detail'      in e) { spinY =  detail; }
      if ('wheelDelta'  in e) { spinY = -wheelDelta  / WHEEL_STEP; }
      if ('wheelDeltaX' in e) { spinX = -wheelDeltaX / WHEEL_STEP; }
      if ('wheelDeltaY' in e) { spinY = -wheelDeltaY / WHEEL_STEP; }

      if (axis != null && axis === e) {
        spinX = spinY;
        spinY = 0;
      }

      // Spin -> Move
      moveX = spinX * PIXEL_STEP;
      moveY = spinY * PIXEL_STEP;

      // Wheel -> Move
      const multiplier = DELTA_MULTIPLIER[deltaMode || 0];
      if ('deltaX' in e) { moveX = deltaX * multiplier; }
      if ('deltaY' in e) { moveY = deltaY * multiplier; }

      // Move -> Spin
      spinX ||= Math.sign(moveX);
      spinY ||= Math.sign(moveY);

      const {left, top} = element.getBoundingClientRect();
      const x = clientX - left;
      const y = clientY - top;

      setWheel((state) => ({
        x,
        y,
        moveX,
        moveY,
        spinX,
        spinY,
        stopped: false,
      }));

      onMove(clientX, clientY);
      onModifiers(e);

      e.preventDefault();
      e.stopPropagation();
    };

    const onMove = (clientX: number, clientY: number) => {
      const {left, top} = element.getBoundingClientRect();
      const x = clientX - left;
      const y = clientY - top;
      setMouse((state) => ({
        ...state,
        x,
        y,
        moveX: x - state.x,
        moveY: y - state.y,
        stopped: false,
      }));
    };

    const onButtons = (buttons: number, button: number) => {
      setMouse((state) => ({
        ...state,
        buttons: toButtons(buttons),
        button: toButton(button),
      }));
    };

    const onTouchStart = (e: TouchEvent) => {
      const {targetTouches: [touch]} = e as any;
      const {clientX, clientY} = touch;
      onButtons(1, 1);
      onMove(clientX, clientY);
      e.preventDefault();
      e.stopPropagation();
    }

    const onTouchMove = (e: TouchEvent) => {
      const {targetTouches: [touch]} = e as any;
      const {clientX, clientY} = touch;
      onMove(clientX, clientY);
      e.preventDefault();
      e.stopPropagation();
    }

    const onTouchEnd = (e: TouchEvent) => {
      const {targetTouches: [touch]} = e as any;
      if (!touch.length) onButtons(0, 1);
      e.preventDefault();
      e.stopPropagation();
    }

    const onMouseDown = (e: MouseEvent) => {
      const {button, buttons, clientX, clientY} = e;
      onButtons(buttons, button);
      onMove(clientX, clientY);
      onModifiers(e);
      e.preventDefault();
      e.stopPropagation();

      element.removeEventListener('mousemove', onMouseMove, CAPTURE_EVENT);
      document.addEventListener('mousemove', onMouseMove, CAPTURE_EVENT);
      document.addEventListener('mouseup', onMouseUp, CAPTURE_EVENT);
    };

    const onMouseMove = (e: MouseEvent) => {
      const {clientX, clientY} = e;
      onMove(clientX, clientY);
      onModifiers(e);
      e.preventDefault();
      e.stopPropagation();
    };

    const onMouseUp = (e: MouseEvent) => {
      const {button, buttons, clientX, clientY} = e;
      onButtons(buttons, button);
      onMove(clientX, clientY);
      onModifiers(e);
      e.preventDefault();
      e.stopPropagation();

      element.addEventListener('mousemove', onMouseMove, CAPTURE_EVENT);
      document.removeEventListener('mousemove', onMouseMove, CAPTURE_EVENT);
      document.removeEventListener('mouseup', onMouseUp, CAPTURE_EVENT);
    };
    
    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };
    
    const onKeyDown = (e: KeyboardEvent) => onModifiers(e);
    const onKeyUp = (e: KeyboardEvent) => onModifiers(e);

    //const onGlobalWheel = (e: WheelEvent) => e.preventDefault();
    
    element.addEventListener('mousedown', onMouseDown, CAPTURE_EVENT);
    element.addEventListener('mousemove', onMouseMove, CAPTURE_EVENT);
    element.addEventListener('contextmenu', onContextMenu, CAPTURE_EVENT);

    element.addEventListener('touchstart', onTouchStart, CAPTURE_EVENT);
    element.addEventListener('touchmove', onTouchMove, CAPTURE_EVENT);
    element.addEventListener('touchend', onTouchEnd, CAPTURE_EVENT);

    document.addEventListener('keydown', onKeyDown, CAPTURE_EVENT);
    document.addEventListener('keyup', onKeyUp, CAPTURE_EVENT);

    element.addEventListener('DOMMouseScroll', onDOMWheel, CAPTURE_EVENT);
    element.addEventListener('wheel', onWheel, CAPTURE_EVENT);

    dispose(() => {
      element.removeEventListener('mousedown', onMouseDown, CAPTURE_EVENT);
      document.removeEventListener('mousemove', onMouseMove, CAPTURE_EVENT);
      document.removeEventListener('mouseup', onMouseUp, CAPTURE_EVENT);

      element.removeEventListener('touchstart', onTouchStart, CAPTURE_EVENT);
      element.removeEventListener('touchmove', onTouchMove, CAPTURE_EVENT);
      element.removeEventListener('touchend', onTouchEnd, CAPTURE_EVENT);

      document.removeEventListener('keydown', onKeyDown, CAPTURE_EVENT);
      document.removeEventListener('keyup', onKeyUp, CAPTURE_EVENT);

      element.removeEventListener('DOMMouseScroll', onDOMWheel, CAPTURE_EVENT);
      element.removeEventListener('wheel', onWheel, CAPTURE_EVENT);
    });
  }, [element]);

  return use(EventProvider, { mouse, wheel, keyboard, children });
}, 'DOMEvents');
