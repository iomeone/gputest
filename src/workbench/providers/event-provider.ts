import type { LiveComponent, LiveElement } from '@use-gpu/live';

import { memo, provide, makeContext, useContext, useMemo, useOne, useResource, useState } from '@use-gpu/live';
import { makeIdAllocator } from '@use-gpu/core';
import { PickingContext } from '../providers/picking-provider';
import { RenderContext } from '../providers/render-provider';

export const EventContext = makeContext<EventContextProps>(undefined, 'EventContext');
export const MouseContext = makeContext<MouseContextProps>(undefined, 'MouseContext');
export const WheelContext = makeContext<WheelContextProps>(undefined, 'WheelContext');
export const KeyboardContext = makeContext<KeyboardContextProps>(undefined, 'KeyboardContext');

export type EventContextProps = {
  useId: () => number,
};

export type MouseContextProps = {
  mouse: MouseState,
  captureId: number | null,
  targetId: number,
  targetIndex: number,
  stopPropagation: () => void,

  hasLock: boolean,
  beginLock: () => void,
  endLock: () => void,
  beginCapture: (id: number) => void,
  endCapture: () => void,
  useMouse: (id?: number | null) => MouseEventState,
};

export type WheelContextProps = {
  wheel: WheelState,
  useWheel: (id?: number | null) => WheelEventState,
};

export type KeyboardContextProps = {
  keyboard: KeyboardState,
  useKeyboard: (id?: number | null) => KeyboardEventState,
};

export type EventProviderProps = {
  mouse: MouseState,
  wheel: WheelState,
  keyboard: KeyboardState,
  pointerLock: PointerLockAPI,
  children?: LiveElement,
};

export type PointerLockAPI = {
  locked: () => boolean,
  lock: () => void,
  unlock: () => void,
};

export type MouseState = {
  buttons: { left: boolean, middle: boolean, right: boolean },
  button: 'left' | 'middle' | 'right' | null,
  x: number,
  y: number,
  moveX: number,
  moveY: number,
};

export type WheelState = {
  x: number,
  y: number,
  moveX: number,
  moveY: number,
  spinX: number,
  spinY: number,
};

export type KeyboardState = {
  modifiers: {
    ctrl: boolean,
    alt: boolean,
    shift: boolean,
    meta: boolean,
  },
  keys: Record<string, boolean>,
  key: string | null,
  char: string | null,
  soft: boolean,
};

export type Stoppable<T> = T & { stopped: boolean };

export type MouseEventState = {
  mouse: MouseState & { stopped: boolean },

  index: number,
  hovered: boolean,
  captured: boolean,
  pressed: { left: boolean, middle: boolean, right: boolean },
  clicks: { left: number, middle: number, right: number },
  presses: { left: number, middle: number, right: number },

  stop: () => void,
};

export type WheelEventState = {
  wheel: WheelState & { stopped: boolean },
  index: number,

  stop: () => void,
};

export type KeyboardEventState = {
  keyboard: KeyboardState & { stopped: boolean },

  stop: () => void,
};

const makeClickTracker = () => ({
  buttons: { left: false, middle: false, right: false },
  pressed: { left: false, middle: false, right: false },
  presses: { left: 0, middle: 0, right: 0 },
  clicks:  { left: 0, middle: 0, right: 0 },
});

const INITIAL_MOUSE = {
  moveX: 0,
  moveY: 0,
};

const INITIAL_WHEEL = {
  moveX: 0,
  moveY: 0,
};

const makeCaptureRef = () => ({
  current: null as number | null,
});

export const EventProvider: LiveComponent<EventProviderProps> = memo((props: EventProviderProps) => {
  const {mouse, wheel, keyboard, pointerLock, children} = props;

  const {pixelRatio} = useContext(RenderContext);
  const pickingContext = useContext(PickingContext);
  const [captureId, setCaptureId] = useState<number | null>(null);

  const captureRef = useOne(makeCaptureRef);
  captureRef.current = captureId;

  const allocId = useOne(() => makeIdAllocator());

  let targetId = -1, targetIndex = -1;
  if (pickingContext) {
    [targetId, targetIndex] = pickingContext.sampleTexture(mouse.x * pixelRatio, mouse.y * pixelRatio);
  }

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

  const m = mouse as Stoppable<MouseState>;
  const w = wheel as Stoppable<WheelState>;
  const k = keyboard as Stoppable<KeyboardState>;

  const stopMouse    = useOne(() => () => m.stopped = true, mouse);
  const stopWheel    = useOne(() => () => w.stopped = true, wheel);
  const stopKeyboard = useOne(() => () => k.stopped = true, keyboard);

  m.stopped = false;
  w.stopped = false;
  k.stopped = false;

  const mouseContext = useMemo(() => ({
    mouse,
    target: {
      captureId,
      targetId,
      targetIndex,
    },
    ...pointerLock,
    beginCapture: (id: number) => setCaptureId(id),
    endCapture: () => setCaptureId(null),
    useMouse: (id: number | null = null): MouseEventState => {
      const ref = useOne(() => ({mouse: {...mouse, ...INITIAL_MOUSE}}));

      const tracker = useOne(makeClickTracker);
      const {pressed, presses, clicks, buttons: lastButtons} = tracker;
      const {buttons} = mouse;

      const index    = targetIndex;
      const captured = captureId === id;
      const hovered  = (captureId == null || captured) && (targetId === id || id === null);

      if (captured || hovered) {
        ref.mouse = mouse;
      }

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
        tracker.buttons = buttons;
      }, buttons);

      return {mouse: ref.mouse as any, index, hovered, captured, pressed, presses, clicks, stop: stopMouse};
    },
  }), [mouse, targetId, captureId]);

  const wheelContext = useMemo(() => ({
    wheel,
    useWheel: (id: number | null = null): WheelEventState => {
      const ref = useOne(() => ({wheel: {...wheel, ...INITIAL_WHEEL}}));

      const index    = targetIndex;
      const captured = captureId === id;
      const hovered  = (captureId == null || captured) && (targetId === id || id === null);

      if (hovered) {
        ref.wheel = wheel;
      }

      return {wheel: ref.wheel as any, index, stop: stopWheel};
    },
  }), [wheel, targetId, captureId]);

  const keyboardContext = useMemo(() => ({
    keyboard,
    useKeyboard: (): KeyboardEventState => {
      return {keyboard: keyboard as any, stop: stopKeyboard};
    },
  }), [keyboard, targetId, captureId]);

  return (
    provide(MouseContext, mouseContext,
      provide(WheelContext, wheelContext,
        provide(KeyboardContext, keyboardContext,
          provide(EventContext, eventApi, children)
        )
      )
    )
  );
}, 'EventProvider');

export const useKeyboard = (id: number | null = null) => useContext(KeyboardContext).useKeyboard(id);
export const useMouse = (id: number | null = null) => useContext(MouseContext).useMouse(id);
export const useWheel = (id: number | null = null) => useContext(WheelContext).useWheel(id);

export const useMouseLock = () => useContext(MouseContext);
