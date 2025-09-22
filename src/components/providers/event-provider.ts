import { LiveComponent, LiveElement } from '@use-gpu/live/types';
import { PickingUniforms } from '@use-gpu/core/types';

import { memo, provide, provideMemo, makeContext, useContext, useMemo, useOne, useResource, useState } from '@use-gpu/live';
import { makeIdAllocator, PICKING_UNIFORMS } from '@use-gpu/core';
import { PickingContext } from '../render/picking';

const CAPTURE_EVENT = {capture: true};

export const EventContext = makeContext(null, 'EventContext');
export const MouseContext = makeContext(null, 'MouseContext');

export type EventProviderProps = {
  element: HTMLElement,
  children: LiveElement<any>,
};

export type MouseEventState = {
  buttons: number,
  x: number,
  y: number,
  index: number,
  hovered: boolean,
  clicked: boolean,
};

export type MouseState = {
  buttons: number,
  x: number,
  y: number,
};

export const EventProvider: LiveComponent<EventProviderProps> = memo((fiber) => ({element, children}) => {
  const {sampleTexture} = useContext(PickingContext);

  const [mouseState, setMouseState] = useState<MouseState>({
    buttons: 0,
    x: 0,
    y: 0,
  });

  const allocId = useOne(() => makeIdAllocator<any>());
  const [mouseTargetId, mouseTargetIndex] = sampleTexture(mouseState.x, mouseState.y);

  const eventApi = useOne(() => ({
    useId: () => useResource((dispose) => {
      const id = allocId.obtain();
      dispose(() => allocId.release(id));
      return id;
    }),
  }));

  const mouseContext = useMemo(() => ({
    mouse: mouseState,
    targetId: mouseTargetId,
    targetIndex: mouseTargetIndex,
    useMouseState: (id: number): MouseEventState => {
      const index   = mouseTargetIndex;
      const hovered = mouseTargetId == id;
      const clicked = hovered && !!(mouseState.buttons & 1);

      return {...mouseState, hovered, clicked, index};
    },
  }), [mouseState, mouseTargetId]);

  useResource((dispose) => {
  }, mouseTargetId);

  useResource((dispose) => {
    let left: number;
    let top: number;

    const onSnapshot = () => ({left, top} = element.getBoundingClientRect());
    onSnapshot();

    const onMove = (buttons: number, clientX: number, clientY: number) => {
      setMouseState({
        buttons,
        x: clientX - left,
        y: clientY - top,
      });
    };

    const onTouchStart = (e: TouchEvent) => {
      const {targetTouches: [touch]} = e as any;
      const {clientX, clientY} = touch;
      onMove(1, clientX, clientY);
    }

    const onTouchMove = (e: TouchEvent) => {
      const {targetTouches: [touch]} = e as any;
      const {clientX, clientY} = touch;
      onMove(1, clientX, clientY);
    }

    const onTouchEnd = (e: TouchEvent) => {
      const {targetTouches: [touch]} = e as any;
      if (!touch.length) setMouseState((state) => ({...state, buttons: 0}));
    }

    const onMouseDown = (e: MouseEvent) => {
      const {buttons, clientX, clientY} = e;
      onMove(buttons, clientX, clientY);
    };

    const onMouseMove = (e: MouseEvent) => {
      const {buttons, clientX, clientY} = e;
      onMove(buttons, clientX, clientY);
    };

    const onMouseUp = (e: MouseEvent) => {
      const {buttons, clientX, clientY} = e;
      onMove(buttons, clientX, clientY);
    };

    element.addEventListener('mousedown', onMouseDown, CAPTURE_EVENT);
    element.addEventListener('mousemove', onMouseMove, CAPTURE_EVENT);
    element.addEventListener('mouseup', onMouseUp, CAPTURE_EVENT);

    element.addEventListener('touchstart', onTouchStart, CAPTURE_EVENT);
    element.addEventListener('touchmove', onTouchMove, CAPTURE_EVENT);
    element.addEventListener('touchend', onTouchEnd, CAPTURE_EVENT);

    dispose(() => {
      element.removeEventListener('mousedown', onMouseDown, CAPTURE_EVENT);
      element.removeEventListener('mousemove', onMouseMove, CAPTURE_EVENT);
      element.removeEventListener('mouseup', onMouseUp, CAPTURE_EVENT);

      element.removeEventListener('touchstart', onTouchStart, CAPTURE_EVENT);
      element.removeEventListener('touchmove', onTouchMove, CAPTURE_EVENT);
      element.removeEventListener('touchend', onTouchEnd, CAPTURE_EVENT);
    });
  }, [element]);

  return provide(MouseContext, mouseContext,
    provideMemo(EventContext, eventApi, children)
  );
}, 'EventProvider');
