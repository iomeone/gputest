import type { LiveComponent, LiveElement } from '@use-gpu/live';

import { use, yeet, memo, provide, unquote, multiGather, makeContext, useCallback, useContext, useNoContext, useMemo, useOne, useResource, useState } from '@use-gpu/live';
import { makeIdAllocator } from '@use-gpu/core';
import { EventReconciler } from '../reconcilers/index';
import { PickingContext } from '../providers/picking-provider';
import { RenderContext } from '../providers/render-provider';

import { PointerCaptureAPI, PointerLockAPI } from './types';

const {reconcile, quote} = EventReconciler;

export const EventContext2 = makeContext<EventContextProps>(undefined, 'EventContext2');
export const MouseContext2 = makeContext<MouseState>(undefined, 'MouseContext2');
export const WheelContext2 = makeContext<WheelState>(undefined, 'WheelContext2');
export const KeyboardContext2 = makeContext<KeyboardState>(undefined, 'KeyboardContext2');

export type EventProviderProps = {
  subscribeEvent: (type: string, handler: ArrowFunction) => void,
  pointerLock: PointerLockAPI,
  children?: LiveElement,
};

export type EventStateProviderProps = {
  subscribeEvent: (type: string, handler: ArrowFunction) => void,
  children?: LiveElement,
};

export type EventContextProps = {
  useId: () => number,
  usePointerCapture: () => PointerCaptureAPI,
  usePointerLock: () => PointerLockAPI,
};

const INITIAL_MOUSE_STATE = {
  buttons: { left: false, middle: false, right: false },
  button: null,
  x: 0,
  y: 0,
  moveX: 0,
  moveY: 0,
};

const INITIAL_WHEEL_STATE = {
  x: 0,
  y: 0,
  moveX: 0,
  moveY: 0,
  spinX: 0,
  spinY: 0,
};

const INITIAL_KEYBOARD_STATE = {};

const makeCaptureIdRef = () => ({
  current: null as number | null,
});

const makePointerEnterIdRef = () => ({
  current: 0,
});

export const EventProvider2: LiveComponent<EventProviderProps> = memo((props: EventProviderProps) => {
  const {subscribeEvent, pointerLock, children} = props;

  // Read ID from picking buffer (callback)
  const pickingContext = useContext(PickingContext);
  const {pixelRatio} = useContext(RenderContext);
  const pick = useCallback((x: number, y: number) => {
    return pickingContext?.sampleTexture(x * pixelRatio, y * pixelRatio) ?? [-1, -1];
  }, [pickingContext, pixelRatio]);

  // Pointer capturing by ID
  const captureIdRef = useOne(makeCaptureIdRef);
  const pointerCapture = useMemo(() => ({
    hasCapture: () => captureIdRef.current,
    beginCapture: (id: number) => { captureIdRef.current = id; },
    endCapture: () => { captureIdRef.current = null; },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);

  // Event API for ID allocation
  const allocId = useOne(() => makeIdAllocator());
  const eventApi = useOne(() => ({
    useObjectId: () => useResource((dispose) => {
      const {hasCapture, endCapture} = pointerCapture;
      const id = allocId.obtain();

      dispose(() => {
        allocId.release(id);
        if (hasCapture() === id) endCapture();
      });
      return id;
    }),

    usePointerCapture: () => pointerCapture,
    usePointerLock: () => pointerLock,
  }));

  // Pointer enter/leave tracking by ID
  const pointerEnterIdRef = useOne(makePointerEnterIdRef);

  // Gather user event handlers
  const Resume = (handlers: Record<string, ArrowFunction[]>) => {

    // Dispatch enter/leave events before move
    const {pointerEnter, pointerLeave, ...rest} = handlers;
    const handlePointerEnterLeave = useCallback((e: any) => {
      if (e.x != null && e.y != null) {
        [e.pickId, e.pickIndex] = pick(e.x, e.y);
      }

      const {current: pointerEnterId} = pointerEnterIdRef;
      if (e.pickId !== pointerEnterId) {
        for (const handler of pointerLeave) if (handler.id === pointerEnterId) handler.callback(e);
        for (const handler of pointerEnter) if (handler.id === e.pickId) handler.callback(e);
        pointerEnterIdRef.current = e.pickId;
      }
    }, [pointerEnter, pointerLeave]);
    useHandler(subscribeEvent, 'pointerMove', handlePointerEnterLeave);

    for (const k in rest) {
      const fn = useMemo(() => {
        const hs = handlers[k];
        return (e: any) => {
          const {current: captureId} = captureIdRef;

          let stopped = false;
          e.stopPropagation = () => {
            e.nativeEvent.stopPropagation();
            stopped = true;
          };

          if (e.x != null && e.y != null && e.pickId === undefined) {
            [e.pickId, e.pickIndex] = pick(e.x, e.y);
          }

          // Dispatch in reverse tree order
          const n = hs.length;
          for (let i = n - 1; i >= 0; i--) {
            const handler = hs[i];

            if (typeof handler === 'object') {
              if ((captureId == null && handler.id === e.pickId) || handler.id === captureId) handler.callback(e);
            }
            else if (captureId == null) {
              handler(e);
            }

            if (stopped) break;
          }
        };
      }, [k, handlers]);

      useHandler(subscribeEvent, k, fn);
    }
  };

  const stack = (
    provide(EventContext2, eventApi,
      use(EventStateProvider, {subscribeEvent, children})
    )
  );

  return reconcile(quote(multiGather(unquote(stack), Resume)));
}, 'EventProvider');

export const EventStateProvider = (props: EventStateProviderProps) => {
  const {subscribeEvent, children} = props;

  // Declarative input state
  const [mouseState, setMouseState] = useState(INITIAL_MOUSE_STATE);
  const [wheelState, setWheelState] = useState(INITIAL_WHEEL_STATE);
  const [keyboardState, setKeyboardState] = useState(INITIAL_KEYBOARD_STATE);

  const handlePointerEvent = useCallback((e: any) => {
    setMouseState(s => ({
      ...s,
      x: e.x,
      y: e.y,
      moveX: e.moveX,
      moveY: e.moveY,
      button: e.button,
      buttons: e.buttons,
    }));
  }, []);

  const handleWheelEvent = useCallback((e: any) => {
    setWheelState(s => ({
      ...s,
      x: e.x,
      y: e.y,
      moveX: e.moveX,
      moveY: e.moveY,
      spinX: e.spinX,
      spinY: e.spinY,
    }));
  }, []);

  const handleKeyDown = useCallback((e: any) => {
    setKeyboardState(s => ({
      ...s,
      [e.key]: true,
    }));
  }, []);

  const handleKeyUp = useCallback((e: any) => {
    setKeyboardState(s => ({
      ...s,
      [e.key]: false,
    }));
  }, []);

  useHandler(subscribeEvent, 'pointerDown', handlePointerEvent);
  useHandler(subscribeEvent, 'pointerMove', handlePointerEvent);
  useHandler(subscribeEvent, 'pointerUp', handlePointerEvent);
  useHandler(subscribeEvent, 'wheel', handleWheelEvent);
  useHandler(subscribeEvent, 'keyDown', handleKeyDown);
  useHandler(subscribeEvent, 'keyUp', handleKeyUp);

  return (
    provide(MouseContext2, mouseState,
      provide(WheelContext2, wheelState,
        provide(KeyboardContext2, keyboardState,
          children
        )
      )
    )
  );
};

const useHandler = (subscribe: ArrowFunction, type: string, handler: ArrowFunction) => {
  useResource((dispose) => dispose(subscribe(type, handler)), [type, handler]);
};

export const useObjectEvents = (callbacks: Record<string, ArrowFunction>) => {
  const id = useObjectId();
  const handlers = useCanvasEvents(id, callbacks);
  return {id, handlers};
};

export const useCanvasEvents = (id: number | null, callbacks: Record<string, ArrowFunction>) => {
  return useOne(() => {
    const handlers = id != null ? {} : callbacks;
    if (id != null) for (const k in callbacks) handlers[k] = { id, callback: callbacks[k] };
    return quote(yeet(handlers));
  }, callbacks);
};

export const useKeyboardState = () => useContext(KeyboardContext2);
export const useMouseState = () => useContext(MouseContext2);
export const useWheelState = () => useContext(WheelContext2);

export const useNoKeyboardState = () => useNoContext(KeyboardContext2);
export const useNoMouseState = () => useNoContext(MouseContext2);
export const useNoWheelState = () => useNoContext(WheelContext2);

export const useObjectId = () => useContext(EventContext2).useObjectId();
export const usePointerLock = () => useContext(EventContext2).usePointerLock();
export const usePointerCapture = () => useContext(EventContext2).usePointerCapture();
