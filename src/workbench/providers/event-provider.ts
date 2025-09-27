import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { PickingUniforms } from '@use-gpu/core';

import { memo, provide, makeContext, useContext, useMemo, useOne, useResource, useState, incrementVersion } from '@use-gpu/live';
import { makeIdAllocator, PICKING_UNIFORMS } from '@use-gpu/core';
import { PickingContext } from '../render/picking';
import { RenderContext } from '../providers/render-provider';

const CAPTURE_EVENT = {capture: true};

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
  children: LiveElement<any>,
};

export type MouseState = {
  buttons: { left: boolean, middle: boolean, right: boolean },
  button: 'left' | 'middle' | 'right' | 'none',
  x: number,
  y: number,
  moveX: number,
  moveY: number,
  stopped: boolean,
};

export type WheelState = {
  x: number,
  y: number,
  moveX: number,
  moveY: number,
  spinX: number,
  spinY: number,
  stopped: boolean,
};

export type KeyboardState = {
  modifiers: {
    ctrl: boolean,
    alt: boolean,
    shift: boolean,
    meta: boolean,
  },
  stopped: boolean,
};

export type MouseEventState = {
  mouse: MouseState & { stop: () => void },
  index: number,
  hovered: boolean,
  captured: boolean,
  pressed: { left: boolean, middle: boolean, right: boolean },
  clicks: { left: number, middle: number, right: number },
  presses: { left: number, middle: number, right: number },

  stop: () => void,
};

export type WheelEventState = {
  wheel: WheelState & { stop: () => void },
  index: number,

  stop: () => void,
};

export type KeyboardEventState = {
  keyboard: KeyboardState & { stop: () => void },

  stop: () => void,
};

const toButtons = (buttons: number) => ({
  left: !!(buttons & 1),
  middle: !!(buttons & 3),
  right: !!(buttons & 2),
});

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

export const EventProvider: LiveComponent<EventProviderProps> = memo(({mouse, wheel, keyboard, children}: EventProviderProps) => {
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
  
  const stopMouse    = useOne(() => (mouse    as any).stop = () => mouse.stopped    = true, mouse);
  const stopWheel    = useOne(() => (wheel    as any).stop = () => wheel.stopped    = true, wheel);
  const stopKeyboard = useOne(() => (keyboard as any).stop = () => keyboard.stopped = true, keyboard);

  mouse.stopped    = false;
  wheel.stopped    = false;
  keyboard.stopped = false;

  const mouseContext = useMemo(() => ({
    mouse,
    captureId,
    targetId,
    targetIndex,
    beginCapture: (id: number) => setCaptureId(id),
    endCapture: () => setCaptureId(null),
    useMouse: (id: number | null = null): MouseEventState => {
      const ref = useOne(() => ({mouse: {...mouse, ...INITIAL_MOUSE}}));

      const tracker = useOne(makeClickTracker);
      const {pressed, presses, clicks, buttons: lastButtons} = tracker;
      const {buttons, button} = mouse;

      const index    = targetIndex;
      const captured = captureId === id;
      const hovered  = (captureId == null || captured) && (targetId === id || id === null);

      if (hovered) {
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
    useKeyboard: (id: number | null = null): KeyboardEventState => {
      const ref = useOne(() => ({keyboard}));

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
