import type { LiveComponent, LiveElement } from '@use-gpu/live';
import { extend, useMemo, useHooks, useState } from '@use-gpu/live';
import { PointerEvent, usePickingId, usePointerCapture, useCanvasEvents, getRenderFunc } from '@use-gpu/workbench';

export type PickState = {
  id: number,
  index: number,
  hovered: boolean,
  pressed: {
    left: boolean,
    middle: boolean,
    right: boolean,
  },
};

export type PickProps = {
  all?: boolean,

  onPointerEnter?: (e: PointerEvent) => void,
  onPointerLeave?: (e: PointerEvent) => void,

  onPointerOver?: (e: PointerEvent, index: number) => void,
  onPointerOut?: (e: PointerEvent, index: number) => void,

  onPointerDown?:  (e: PointerEvent, index: number) => void,
  onPointerUp?:    (e: PointerEvent, index: number) => void,
  onPointerMove?:  (e: PointerEvent, index: number) => void,

  render?: (state: PickState) => LiveElement,
  children?: LiveElement | ((state: PickState) => LiveElement),
};

const INITIAL_BUTTON_STATE = { left: false, middle: false, right: false };

export const Pick: LiveComponent<PickProps> = (props: PickProps) => {
  const {
    all,
    children,
    onPointerEnter,
    onPointerLeave,
    onPointerOver,
    onPointerOut,
    onPointerDown,
    onPointerUp,
    onPointerMove,
  } = props;

  const {beginCapture} = usePointerCapture();

  const [hovered, setHovered] = useState(false);
  const [index, setIndex] = useState(-1);
  const [pressed, setPressed] = useState(INITIAL_BUTTON_STATE);

  const callbacks = useMemo(() => ({
    pointerDown: (e: any) => {
      if (!all) beginCapture(e);
      onPointerDown?.(e, e.pickIndex);
      setPressed(e.buttons);
      e.stopPropagation();
    },
    pointerUp: (e: any) => {
      onPointerUp?.(e, e.pickIndex);
      setPressed(e.buttons);
    },

    pointerEnter: (e: any) => {
      setHovered(true);
      onPointerEnter?.(e);
    },
    pointerOver: (e: any) => {
      onPointerOver?.(e, e.pickIndex);
    },
    pointerMove: (e: any) => {
      setIndex(e.pickIndex);
      onPointerMove?.(e, e.pickIndex);
    },
    pointerOut: (e: any) => {
      onPointerOut?.(e, e.pickIndex);
    },
    pointerLeave: (e: any) => {
      setHovered(false);
      setIndex(-1);
      onPointerLeave?.(e);
    },
  }), [
    all,
    onPointerEnter,
    onPointerLeave,
    onPointerOver,
    onPointerOut,
    onPointerDown,
    onPointerUp,
    onPointerMove,
    beginCapture,
  ]);

  const id = usePickingId();
  const handlers = useCanvasEvents(all ? -id : id, callbacks);

  const value = useMemo(
    () => ({id, index, hovered, pressed}),
    [id, index, hovered, pressed]
  );

  const render = getRenderFunc(props);

  return useHooks(() =>
    [handlers, render ? render(value) : (children ? extend(children as LiveElement, {id}) : null)],
    [render, children, value]
  );
};
