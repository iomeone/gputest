import type { LiveComponent, LiveElement } from '../../live';
import { extend, useMemo, useHooks, useState } from '../../live';
import { PointerEvent, usePickingId, useNoPickingId, usePointerCapture, useCanvasEvents, getRenderFunc } from '../../workbench';

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
  id?: number,
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
      if (!all) {
        beginCapture(e);
        e.stopPropagation();
      }
      onPointerDown?.(e, e.pickIndex);
      setPressed(e.buttons);
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

  const id = props.id == null ? usePickingId() : (useNoPickingId(), props.id);
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
