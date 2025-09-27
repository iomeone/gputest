import { LiveComponent, LiveElement } from '@use-gpu/live/types';

import { use, memo, useResource, useState, incrementVersion } from '@use-gpu/live';
import { EventProvider } from '../providers/event-provider';

const CAPTURE_EVENT = {capture: true};

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
  version: 0,
});

const makeWheelState = () => ({
  moveX: 0,
  moveY: 0,
  version: 0,
});

export const DOMEvents: LiveComponent<DOMEventsProps> = memo(({element, children}: DOMEventsProps) => {
  const [mouse, setMouse] = useState<MouseState>(makeMouseState);
  const [wheel, setWheel] = useState<WheelState>(makeWheelState);

  useResource((dispose) => {
    const onWheel = (e: WheelEvent) => {
      const {deltaMode, deltaX, deltaY} = e;
      let f = 1;
      if (deltaMode === 1) f = 10;
      if (deltaMode === 2) f = 30;

      setWheel((state) => ({
        moveX: deltaX * f,
        moveY: deltaY * f,
        version: incrementVersion(state.version),
      }));

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
        version: incrementVersion(state.version),
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
      if (!(buttons & 1)) onButtons(1, 1);
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
      e.preventDefault();
      e.stopPropagation();

      element.removeEventListener('mousemove', onMouseMove, CAPTURE_EVENT);
      document.addEventListener('mousemove', onMouseMove, CAPTURE_EVENT);
      document.addEventListener('mouseup', onMouseUp, CAPTURE_EVENT);
    };

    const onMouseMove = (e: MouseEvent) => {
      const {clientX, clientY} = e;
      onMove(clientX, clientY);
      e.preventDefault();
      e.stopPropagation();
    };

    const onMouseUp = (e: MouseEvent) => {
      const {button, buttons, clientX, clientY} = e;
      onButtons(buttons, button);
      onMove(clientX, clientY);
      e.preventDefault();
      e.stopPropagation();

      element.addEventListener('mousemove', onMouseMove, CAPTURE_EVENT);
      document.removeEventListener('mousemove', onMouseMove, CAPTURE_EVENT);
      document.removeEventListener('mouseup', onMouseUp, CAPTURE_EVENT);
    };

    element.addEventListener('mousedown', onMouseDown, CAPTURE_EVENT);
    element.addEventListener('mousemove', onMouseMove, CAPTURE_EVENT);

    element.addEventListener('touchstart', onTouchStart, CAPTURE_EVENT);
    element.addEventListener('touchmove', onTouchMove, CAPTURE_EVENT);
    element.addEventListener('touchend', onTouchEnd, CAPTURE_EVENT);

    element.addEventListener('wheel', onWheel);

    dispose(() => {
      element.removeEventListener('mousedown', onMouseDown, CAPTURE_EVENT);
      document.removeEventListener('mousemove', onMouseMove, CAPTURE_EVENT);
      document.removeEventListener('mouseup', onMouseUp, CAPTURE_EVENT);

      element.removeEventListener('touchstart', onTouchStart, CAPTURE_EVENT);
      element.removeEventListener('touchmove', onTouchMove, CAPTURE_EVENT);
      element.removeEventListener('touchend', onTouchEnd, CAPTURE_EVENT);

      element.removeEventListener('wheel', onWheel);
    });
  }, [element]);

  return use(EventProvider, { mouse, wheel, children });
}, 'DOMEvents');
