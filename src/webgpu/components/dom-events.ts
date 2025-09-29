import type { LiveComponent, PropsWithChildren } from '@use-gpu/live';

import { use, memo, useMemo, useOne, useResource, useState } from '@use-gpu/live';
import { EventProvider, MouseState, WheelState, KeyboardState } from '@use-gpu/workbench';//'/providers/event-provider';

const WHEEL_STEP = 120;
const PIXEL_STEP = 10;
const DELTA_MULTIPLIER = [1, 4, 80];

const formatKey = (key: string) => key[0].toLowerCase() + key.slice(1);

export type DOMEventsProps = {
  element: HTMLElement,
  autofocus?: boolean,
  capture?: boolean,
  iframe?: boolean,
};

const toButton = (button: number) => {
  if (button === 0) return 'left';
  if (button === 1) return 'middle';
  if (button === 2) return 'right';
  return null;
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
  keys: {},
  key: null,
  stopped: false,
} as KeyboardState);

export const DOMEvents: LiveComponent<DOMEventsProps> = memo((props: PropsWithChildren<DOMEventsProps>) => {
  const {element, autofocus, capture, iframe, children} = props;

  const captureOptions = useOne(() => ({capture: !!capture}), capture);

  useResource((dispose) => {
    if (element.tabIndex !== -1) return;

    element.setAttribute('tabIndex', '0');
    element.style.setProperty('outline', 'none');

    if (autofocus) element.focus();

    dispose(() => {
      element.setAttribute('tabIndex', '-1');
      element.style.setProperty('outline', '');
    });
  }, [autofocus]);

  const [mouse, setMouse] = useState<MouseState>(makeMouseState);
  const [wheel, setWheel] = useState<WheelState>(makeWheelState);
  const [keyboard, setKeyboard] = useState<KeyboardState>(makeKeyboardState);

  const pointerLock = useMemo(() => ({
    hasLock: document.pointerLockElement === element,
    beginLock: () => element.requestPointerLock(),
    endLock: () => document.exitPointerLock(),
  }), [element, document.pointerLockElement]);

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

    const onKeyDown = (event: KeyboardEvent) => {
      onModifiers(event);
      setKeyboard((state) => {
        const k = formatKey(event.key);
        return {
          ...state,
          keys: {
            ...state.keys,
            [k]: true,
          },
          key: k,
          stopped: false,
        };
      });
    };

    const onKeyUp = (event: KeyboardEvent) => {
      onModifiers(event);
      setKeyboard((state) => {
        const k = formatKey(event.key);
        return {
          ...state,
          keys: {
            ...state.keys,
            [k]: false,
          },
          key: k,
          stopped: false,
        };
      });
    };

    // Special Firefox-only event. Prefer if available.
    const onDOMWheel = (e: any) => {
      element.removeEventListener('wheel', onWheel, captureOptions);
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

    const onMove = (clientX: number, clientY: number, moveX?: number, moveY?: number) => {
      const {left, top} = element.getBoundingClientRect();
      const x = clientX - left;
      const y = clientY - top;
      setMouse((state) => ({
        ...state,
        x,
        y,
        moveX: moveX ?? x - state.x,
        moveY: moveY ?? y - state.y,
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
      onButtons(1, 0);
      onMove(clientX, clientY, 0, 0);
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
      if (!touch?.length) onButtons(0, 0);
      e.preventDefault();
      e.stopPropagation();
    }

    const onMouseDown = (e: PointerEvent) => {
      const {button, buttons, clientX, clientY} = e;
      if (e.target) (e.target as HTMLElement).setPointerCapture(e.pointerId);

      onButtons(buttons, button);
      onMove(clientX, clientY, 0, 0);
      onModifiers(e);

      // https://bugs.chromium.org/p/chromium/issues/detail?id=1300622
      if (!iframe) e.preventDefault();
      e.stopPropagation();

      element.focus();

      element.removeEventListener('pointermove', onMouseMove, captureOptions);
      document.addEventListener('pointerenter', onMouseMove, captureOptions);
      document.addEventListener('pointermove', onMouseMove, captureOptions);
      document.addEventListener('pointerup', onMouseUp, captureOptions);
    };

    const onMouseMove = (e: PointerEvent) => {
      const {clientX, clientY, movementX, movementY} = e;
      onMove(clientX, clientY, movementX, movementY);
      onModifiers(e);
      e.preventDefault();
      e.stopPropagation();
    };

    const onMouseUp = (e: PointerEvent) => {
      const {button, buttons, clientX, clientY} = e;
      onButtons(buttons, button);
      onMove(clientX, clientY, 0, 0);
      onModifiers(e);
      e.preventDefault();
      e.stopPropagation();

      element.addEventListener('pointermove', onMouseMove, captureOptions);
      document.removeEventListener('pointerenter', onMouseMove, captureOptions);
      document.removeEventListener('pointermove', onMouseMove, captureOptions);
      document.removeEventListener('pointerup', onMouseUp, captureOptions);
    };

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };
    
    const onWindowBlur = () => {
      setKeyboard((state) => {
        return {
          ...state,
          keys: {},
          key: null,
          stopped: true,
        };
      });
    };

    //const onGlobalWheel = (e: WheelEvent) => e.preventDefault();

    element.addEventListener('pointerdown', onMouseDown, captureOptions);
    element.addEventListener('pointermove', onMouseMove, captureOptions);
    element.addEventListener('contextmenu', onContextMenu, captureOptions);

    element.addEventListener('touchstart', onTouchStart, captureOptions);
    element.addEventListener('touchmove', onTouchMove, captureOptions);
    element.addEventListener('touchend', onTouchEnd, captureOptions);

    element.addEventListener('keydown', onKeyDown, captureOptions);
    element.addEventListener('keyup', onKeyUp, captureOptions);

    element.addEventListener('DOMMouseScroll', onDOMWheel, captureOptions);
    element.addEventListener('wheel', onWheel, captureOptions);

    window.addEventListener('blur', onWindowBlur, captureOptions);

    dispose(() => {
      document.removeEventListener('pointerenter', onMouseMove, captureOptions);
      document.removeEventListener('pointermove', onMouseMove, captureOptions);
      document.removeEventListener('pointerup', onMouseUp, captureOptions);

      element.removeEventListener('pointerdown', onMouseDown, captureOptions);
      element.removeEventListener('pointermove', onMouseMove, captureOptions);
      element.removeEventListener('contextmenu', onContextMenu, captureOptions);

      element.removeEventListener('touchstart', onTouchStart, captureOptions);
      element.removeEventListener('touchmove', onTouchMove, captureOptions);
      element.removeEventListener('touchend', onTouchEnd, captureOptions);

      element.removeEventListener('keydown', onKeyDown, captureOptions);
      element.removeEventListener('keyup', onKeyUp, captureOptions);

      element.removeEventListener('DOMMouseScroll', onDOMWheel, captureOptions);
      element.removeEventListener('wheel', onWheel, captureOptions);

      window.removeEventListener('blur', onWindowBlur, captureOptions);
    });
  }, [element]);

  return use(EventProvider, { mouse, wheel, keyboard, pointerLock, children });
}, 'DOMEvents');
