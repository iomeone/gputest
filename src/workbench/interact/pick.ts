import type { LiveComponent, LiveElement } from '@use-gpu/live';
import { extend, useContext, useMemo, useNoMemo, useOne, useResource, useNoResource } from '@use-gpu/live';
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
  index: number,
};

export type PickProps = {
  capture?: boolean,
  render?: (state: PickState) => LiveElement<any>,
  children?: LiveElement<any>,
  onMouseOver?: (m: MouseEventState, index: number) => void,
  onMouseOut?:  (m: MouseEventState, index: number) => void,
  onMouseDown?: (m: MouseEventState, index: number) => void,
  onMouseUp?:   (m: MouseEventState, index: number) => void,
  onMouseMove?: (m: MouseEventState, index: number) => void,
}

export const Pick: LiveComponent<PickProps> = ({
  capture,
  render,
  children,
  onMouseOver,
  onMouseOut,
  onMouseDown,
  onMouseUp,
  onMouseMove,
}) => {
  const { useId } = useContext(EventContext);
  const { useMouse, beginCapture, endCapture } = useContext(MouseContext);

  const id = useId();
  const mouse = useMouse(id);
  const { mouse: {x, y}, hovered, captured, pressed, presses, clicks, index } = mouse;

  const mouseRef = useOne(() => ({current: mouse}));
  mouseRef.current = mouse;

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

  return useMemo(() =>
    render ? render({id, index, hovered, pressed, presses, clicks}) : (children ? extend(children, {id}) : null),
    [render, children, id, index, hovered, pressed, count]
  );
};

