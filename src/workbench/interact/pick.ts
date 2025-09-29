import type { LiveComponent, LiveElement, PropsWithChildren } from '@use-gpu/live';
import { extend, useContext, useMemo, useNoMemo, useOne, useResource, useNoResource, useYolo } from '@use-gpu/live';
import { EventContext, MouseContext, MouseEventState } from '../providers/event-provider';

export type PickState = {
  id: number,
  hovered: boolean,
  pressed: {
    left: boolean,
    middle: boolean,
    right: boolean,
  },
  presses: {
    left: number,
    middle: number,
    right: number,
  },
  clicks: {
    left: number,
    middle: number,
    right: number,
  },
  x: number,
  y: number,
  moveX: number,
  moveY: number,
  index: number,
};

export type PickProps = {
  all?: boolean,
  move?: boolean,
  capture?: boolean,
  render?: (state: PickState) => LiveElement,
  onMouseOver?: (m: MouseEventState, index: number) => void,
  onMouseOut?:  (m: MouseEventState, index: number) => void,
  onMouseDown?: (m: MouseEventState, index: number) => void,
  onMouseUp?:   (m: MouseEventState, index: number) => void,
  onMouseMove?: (m: MouseEventState, index: number) => void,
}

export const Pick: LiveComponent<PickProps> = ({
  all,
  move,
  capture,
  render,
  children,
  onMouseOver,
  onMouseOut,
  onMouseDown,
  onMouseUp,
  onMouseMove,
}: PropsWithChildren<PickProps>) => {
  const { useId } = useContext(EventContext);
  const { useMouse, beginCapture, endCapture } = useContext(MouseContext);

  const id = useId();
  const mouse = useMouse(all ? undefined : id);
  const { mouse: {x, y, moveX, moveY}, hovered, captured, pressed, presses, clicks, index } = mouse;

  const mouseRef = useOne(() => ({current: mouse}));
  mouseRef.current = mouse;

  const countRef = useOne(() => ({current: 0}));
  useMemo(() => countRef.current++, [x, y]);

  if (onMouseMove) {
    useMemo(() => {
      if (hovered || captured) {
        if (onMouseMove) onMouseMove(mouse, index);
      }
    }, [x, y]);
  }
  else {
    useNoMemo();
  }

  if (onMouseOver || onMouseOut) {
    useResource((dispose) => {
      if (hovered) {
        if (onMouseOver) onMouseOver(mouse, index);
        if (onMouseOut) dispose(() => onMouseOut(mouse, index));
      }
    }, [hovered, index]);
  }
  else {
    useNoResource();
  }

  if (onMouseDown || onMouseUp || capture) {
    const { left, middle, right } = pressed;
    useResource((dispose) => {
      if (left) {
        if (onMouseDown) onMouseDown(mouse, index);
        if (capture) beginCapture(id);
        dispose(() => {
          if (capture) endCapture();
          if (onMouseUp) onMouseUp(mouseRef.current, index);
        });
      }
    }, [left]);
    useResource((dispose) => {
      if (middle) {
        if (onMouseDown) onMouseDown(mouse, index);
        if (capture) beginCapture(id);
        dispose(() => {
          if (capture) endCapture();
          if (onMouseUp) onMouseUp(mouseRef.current, index);
        });
      }
    }, [middle]);
    useResource((dispose) => {
      if (right) {
        if (onMouseDown) onMouseDown(mouse, index);
        if (capture) beginCapture(id);
        dispose(() => {
          if (capture) endCapture();
          if (onMouseUp) onMouseUp(mouseRef.current, index);
        });
      }
    }, [right]);
  }
  else {
    useNoResource();
    useNoResource();
    useNoResource();
  }

  const count = presses.left + clicks.left + presses.middle + clicks.middle + presses.right + clicks.right;

  const px = move ? x : 0;
  const py = move ? y : 0;

  const dx = move ? moveX : 0;
  const dy = move ? moveY : 0;

  if (move && countRef.current === 1) return null; 

  return useYolo(() =>
    render ? render({id, index, hovered, pressed, presses, clicks, x: px, y: py, moveX: dx, moveY: dy}) : (children ? extend(children, {id}) : null),
    [render, children, id, index, hovered, pressed, count, px, py, dx, dy]
  );
};

