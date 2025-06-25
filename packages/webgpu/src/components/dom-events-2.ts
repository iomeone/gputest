import type { XY, Ref, LiveComponent, PropsWithChildren } from '@use-gpu/live';

import { proxy } from '@use-gpu/core';
import { use, memo, useMemo, useOne, useResource } from '@use-gpu/live';
import { EventProvider2 } from '@use-gpu/workbench';

import { DOM_EVENT_PROPS } from './dom-props';

const WHEEL_STEP = 120;
const PIXEL_STEP = 10;
const DELTA_MULTIPLIER = [1, 4, 80];

export type DOMEventsProps = PropsWithChildren<{
  element: HTMLElement,
  autofocus?: boolean,
  capture?: boolean,
}>;

export type EventCallback<T> = (event: T, element: HTMLElement) => void;

const handlePointerCapture = (e: PointerEvent) => (e.target as any)?.setPointerCapture?.(e.pointerId);

const makeLastPosRef = () => ({current: null as XY | null});
const makeMoveRef = () => ({current: [0, 0] as XY});

export const DOMEvents: LiveComponent<DOMEventsProps> = memo((props: DOMEventsProps) => {
  const {element, autofocus, capture, children} = props;

  // Make canvas DOM-focusable
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

  // Pointer lock API
  const pointerLock = useMemo(() => ({
    hasLock: () => document.pointerLockElement === element,
    beginLock: () => element.requestPointerLock(),
    endLock: () => document.exitPointerLock(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [element, document.pointerLockElement]);

  // Track mouse motion to harmonize across browsers
  const lastPosRef = useOne(makeLastPosRef);
  const moveRef = useOne(makeMoveRef);

  // Event capturing mode
  const domCaptureOptions = useOne(() => ({capture: !!capture}), capture);
  const subscribeEvent = useMemo(() => (
    makeDOMSubscriber(element, domCaptureOptions, moveRef)
  ), [element, domCaptureOptions, moveRef]);

  useHandler(subscribeEvent, 'pointerDown', handlePointerCapture);
  useHandler(subscribeEvent, 'pointerMove', (e: any) => {
    const {current: last} = lastPosRef;
    const {current: move} = moveRef;

    if (last) {
      const [x, y] = last;
      move[0] = e.clientX - x;
      move[1] = e.clientY - y;
      last[0] = e.clientX;
      last[1] = e.clientY;
    }
    else {
      move[0] = 0;
      move[1] = 0;
      lastPosRef.current = [e.clientX, e.clientY];
    }
  });
  useHandler(subscribeEvent, 'pointerOut', () => {
    lastPosRef.current = null;
  });

  return use(EventProvider2, {subscribeEvent, pointerLock, children});
}, 'DOMEvents2');

const useHandler = (subscribe: ArrowFunction, type: string, handler: ArrowFunction) => {
  useResource((dispose) => dispose(subscribe(type, handler)), [type, handler]);
};

const makeDOMSubscriber = (
  el: HTMLElement,
  domCaptureOptions: any,
  moveRef?: Ref<XY>,
) => (
  type: string,
  handler: ArrowFunction,
) => {
  const t = type.toLowerCase();
  const f = (e: Event) => {
    const {current: move} = moveRef;

    const decorate = type === 'wheel' ? harmonizeWheelProps : undefined;
    const extra = decorate?.(e);

    const ev = makeSyntheticEvent(el, e, extra, stop, move);
    handler(ev, el);
  };

  if (t === 'wheel') return subscribeDOMWheelEvent(el, handler, domCaptureOptions);

  el.addEventListener(t, f, domCaptureOptions);
  return () => {
    el.removeEventListener(t, f, domCaptureOptions);
  };
}

const subscribeDOMWheelEvent = (
  el: HTMLElement,
  handler: ArrowFunction,
  domCaptureOptions: any,
) => {
  const onDOMMouseScroll = (e: any) => {
    element.removeEventListener('wheel', handler, domCaptureOptions);
    handler(e);
  };

  el.addEventListener('DOMMouseScroll', onDOMMouseScroll, domCaptureOptions);
  el.addEventListener('wheel', handler, domCaptureOptions);

  return () => {
    el.removeEventListener('DOMMouseScroll', onDOMMouseScroll, domCaptureOptions);
    el.removeEventListener('wheel', handler, domCaptureOptions);
  };
}

const makeSyntheticEvent = (
  element: HTMLElement,
  nativeEvent: any,
  extra?: Record<string, any>,
  stop?: ArrowFunction,
  move?: XY,
) => {
  const {clientX, clientY} = nativeEvent;

  const button = toButton(nativeEvent.button);
  const buttons = toButtons(nativeEvent.buttons);

  const mapped: Record<string, any> = {};
  const event: Record<string, any> = {nativeEvent, button, buttons};
  for (const k of DOM_EVENT_PROPS) if (k in nativeEvent) {
    mapped[k] = () => nativeEvent[k];
  }
  for (const k in extra) {
    event[k] = extra[k];
  }

  if (clientX != null && clientY != null) {
    const {left, top} = element.getBoundingClientRect();
    event.x = clientX - left;
    event.y = clientY - top;

    if (move && !('moveX' in event)) {
      event.moveX = move[0];
      event.moveY = move[1];
    }
  }

  event.stopPropagation = () => {
    nativeEvent.stopPropagation();
    stop?.();
  };

  return proxy(event, mapped);
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

const harmonizeWheelProps = (e: any) => {
  const {
    deltaMode, deltaX, deltaY,
    detail, axis,
    wheelDelta, wheelDeltaX, wheelDeltaY,
  } = e;

  let moveX = 0;
  let moveY = 0;
  let spinX = 0;
  let spinY = 0;

  // Wheel -> Spin
  if ('detail'      in e) { spinY =  detail; }
  if ('wheelDelta'  in e) { spinY = -wheelDelta  / WHEEL_STEP; }
  if ('wheelDeltaX' in e) { spinX = -wheelDeltaX / WHEEL_STEP; }
  if ('wheelDeltaY' in e) { spinY = -wheelDeltaY / WHEEL_STEP; }

  if (axis != null && axis === 1) {
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

  return {
    moveX,
    moveY,
    spinX,
    spinY,
  };
};
