import type { LiveComponent, LiveElement } from '@use-gpu/live';
import { extend, useMemo, useHooks, useState } from '@use-gpu/live';
import { useObjectId, usePointerCapture, useCanvasEvents } from '../providers/event-provider';
import { getRenderFunc } from '../hooks/useRenderProp';
import { PointerEvent } from './types';

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
  move?: boolean,
  onPointerEnter?: (e: PointerEvent, index: number) => void,
  onPointerLeave?: (e: PointerEvent, index: number) => void,
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
    move,
    children,
    onPointerEnter,
    onPointerLeave,
    onPointerDown,
    onPointerUp,
    onPointerMove,
  } = props;

  const {beginCapture, endCapture} = usePointerCapture();

  const [hovered, setHovered] = useState(false);
  const [index, setIndex] = useState(-1);
  const [moved, setMoved] = useState(false);
  const [pressed, setPressed] = useState(INITIAL_BUTTON_STATE);

  const id = useObjectId();
  const callbacks = useMemo(() => ({
    pointerDown: (e: any) => {
      if (!all) beginCapture(id);
      onPointerDown?.(e, e.pickIndex);
      setPressed(e.buttons);
    },
    pointerUp: (e: any) => {
      if (!all) endCapture();
      onPointerUp?.(e, e.pickIndex);
      setPressed(e.buttons);
    },

    pointerEnter: (e: any) => {
      setHovered(true);
      onPointerEnter?.(e, e.pickIndex);
    },
    pointerMove: (e: any) => {
      setMoved(true);
      setIndex(e.pickIndex);
      onPointerMove?.(e, e.pickIndex);
    },
    pointerLeave: (e: any) => {
      setHovered(false);
      setIndex(-1);
      onPointerLeave?.(e, e.pickIndex);
    },
  }), [
    all,
    id,
    onPointerEnter,
    onPointerLeave,
    onPointerDown,
    onPointerUp,
    onPointerMove,
    beginCapture,
    endCapture,
  ]);

  const handlers = useCanvasEvents(all ? null : id, callbacks);

  if (move && !moved) return null;

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
