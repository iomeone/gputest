import type { LiveComponent, LiveElement, ArrowFunction } from '@use-gpu/live';

import { use, yeet, memo, provide, unquote, multiGather, makeContext, useCallback, useContext, useNoContext, useMemo, useOne, useResource, useState } from '@use-gpu/live';
import { seq, proxy, makeIdAllocator } from '@use-gpu/core';
import { EventHandler, EventBinding, MouseState, WheelState, KeyboardState, PointerCaptureAPI, PointerLockAPI } from '../interact/event';
import { PickingContext } from '../providers/picking-provider';
import { RenderContext } from '../providers/render-provider';
import { EventReconciler } from '../reconcilers/index';

const {reconcile, quote} = EventReconciler;

export const EventContext = makeContext<EventContextProps>(undefined, 'EventContext');
export const MouseContext = makeContext<MouseState>(undefined, 'MouseContext');
export const WheelContext = makeContext<WheelState>(undefined, 'WheelContext');
export const KeyboardContext = makeContext<KeyboardState>(undefined, 'KeyboardContext');

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
  useObjectId: () => number,
  useObjectIds: (n: number) => number[],
  usePointerCapture: () => PointerCaptureAPI,
  usePointerLock: () => PointerLockAPI,
};

const INITIAL_MOUSE_STATE = {
  buttons: { left: false, middle: false, right: false },
  button: null,
  x: 0,
  y: 0,
  u: 0,
  v: 0,
  moveX: 0,
  moveY: 0,
};

const INITIAL_WHEEL_STATE = {
  x: 0,
  y: 0,
  u: 0,
  v: 0,
  moveX: 0,
  moveY: 0,
  spinX: 0,
  spinY: 0,
};

const INITIAL_KEYBOARD_STATE = {};

const makeCaptureIdRef = () => ({
  current: null as number | null,
});

const makeIdRef = () => ({
  current: 0,
});

export const EventProvider: LiveComponent<EventProviderProps> = memo((props: EventProviderProps) => {
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
    useObjectIds: (n: number) => useResource((dispose) => {
      const {hasCapture, endCapture} = pointerCapture;
      const ids = seq(n).map(allocId.obtain);

      dispose(() => {
        for (const id of ids) {
          allocId.release(id);
          if (hasCapture() === id) endCapture();
        }
      });
      return ids;
    }, [n]),

    usePointerCapture: () => pointerCapture,
    usePointerLock: () => pointerLock,
  }));

  // Pointer enter/leave over/out tracking by ID
  const pointerEnterIdRef = useOne(makeIdRef);
  const pointerOverIndexRef = useOne(makeIdRef);

  const annotateEvent = (e: any) => {
    if (e.x != null && e.y != null && e.pickId === undefined) {
      [e.pickId, e.pickIndex] = pick(e.x, e.y);
    }
  };

  // Gather user event handlers
  const Resume = (handlers: Record<string, EventHandler[]>) => {

    // Dispatch enter/leave/over/out events before move
    // -- Enter/exit is by ID
    // -- Over/out is by index
    const {pointerEnter, pointerLeave, pointerOver, pointerOut, ...rest} = handlers;
    const handlePointerEnterLeave = useCallback((e: any) => {
      annotateEvent(e);

      const {current: pointerEnterId} = pointerEnterIdRef;
      const {current: pointerOverIndex} = pointerOverIndexRef;

      const differentId = e.pickId !== pointerEnterId;
      const differentIndex = e.pickIndex !== pointerOverIndex;

      if (differentId || differentIndex) {
        if (pointerOut) {
          const ev = proxy(e, {type: 'pointerOut'});
          for (const handler of pointerOut) {
            if ((handler as EventBinding).id === pointerEnterId) (handler as EventBinding).callback(ev);
          }
        }
      }

      if (differentId) {
        if (pointerLeave) {
          const ev = proxy(e, {type: 'pointerLeave'});
          for (const handler of pointerLeave) {
            if ((handler as EventBinding).id === pointerEnterId) (handler as EventBinding).callback(ev);
          }
        }
        if (pointerEnter) {
          const ev = proxy(e, {type: 'pointerEnter'});
          for (const handler of pointerEnter) {
            if ((handler as EventBinding).id === e.pickId) (handler as EventBinding).callback(ev);
          }
        }

        pointerEnterIdRef.current = e.pickId;
      }

      if (differentId || differentIndex) {
        if (pointerOver) {
          const ev = proxy(e, {type: 'pointerOver'});
          for (const handler of pointerOver) {
            if ((handler as EventBinding).id === e.pickId) (handler as EventBinding).callback(ev);
          }
        }
        pointerOverIndexRef.current = e.pickIndex;
      }
    }, [pointerEnter, pointerLeave, pointerOver, pointerOut]);
    useHandler(subscribeEvent, 'pointerMove', handlePointerEnterLeave);

    for (const k in rest) {
      if (k.match(/^mouse/)) throw new Error("Mouse events are unsupported, use Pointer events instead.");

      const fn = useMemo(() => {
        const hs = handlers[k];
        return (e: any) => {
          const {current: captureId} = captureIdRef;

          let stopped = false;
          e.stopPropagation = () => {
            e.nativeEvent.stopPropagation();
            stopped = true;
          };

          annotateEvent(e);

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

    return null;
  };

  const stack = (
    provide(EventContext, eventApi,
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
    provide(MouseContext, mouseState,
      provide(WheelContext, wheelState,
        provide(KeyboardContext, keyboardState,
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
  return useMemo(() => {
    const handlers: Record<string, EventHandler> = id != null ? {} : callbacks;
    if (id != null) for (const k in callbacks) handlers[k] = { id, callback: callbacks[k] };
    return quote(yeet(handlers));
  }, [id, callbacks]);
};

export const useKeyboardState = () => useContext(KeyboardContext);
export const useMouseState = () => useContext(MouseContext);
export const useWheelState = () => useContext(WheelContext);

export const useNoKeyboardState = () => useNoContext(KeyboardContext);
export const useNoMouseState = () => useNoContext(MouseContext);
export const useNoWheelState = () => useNoContext(WheelContext);

export const useObjectId = () => useContext(EventContext).useObjectId();
export const useObjectIds = (n: number) => useContext(EventContext).useObjectIds(n);
export const usePointerLock = () => useContext(EventContext).usePointerLock();
export const usePointerCapture = () => useContext(EventContext).usePointerCapture();
