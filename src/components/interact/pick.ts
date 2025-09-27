import { LiveComponent, LiveElement } from '@use-gpu/live/types';
import { useContext, useMemo, useOne, useResource, useNoResource } from '@use-gpu/live';
import { EventContext, MouseContext, MouseEventState } from '../providers/event-provider';

type PickState = {id: number, hovered: boolean, pressed: boolean, index: number};

export type PickProps = {
  capture?: boolean,
  render?: (state: PickState) => LiveElement<any>,
  children?: LiveElement<any>,
  onMouseEnter?: (m: MouseEventState) => void,
  onMouseLeave?: (m: MouseEventState) => void,
  onMouseDown?: (m: MouseEventState) => void,
  onMouseUp?: (m: MouseEventState) => void,
  onMouseMove?: (m: MouseEventState) => void,
}

export const Pick: LiveComponent<PickProps> = ({
  render,
  children,
  onMouseOver,
  onMouseOut,
  onMouseDown,
  onMouseUp,
  onMouseMove,
}) => {
  const { useId } = useContext(EventContext);
  const { useMouse } = useContext(MouseContext);

  const id = useId();
  const mouse = useMouse(id);
  const { buttons, x, y, hovered, captured, pressed, presses, clicks, index } = mouse;

  const ref = useOne(() => ({mouse}));
  ref.mouse = mouse;

  if (onMouseMove) {
    useResource(() => {
      if (hovered || captured) {
        if (onMouseMove) onMouseMove(ref.mouse);
      }
    }, [x, y]);
  }
  else {
    useNoResource();
  }

  if (onMouseOver || onMouseOut) {
    useResource((dispose) => {
      if (hovered) {
        if (onMouseOver) onMouseOver(ref.mouse);
        if (onMouseOut) dispose(() => onMouseOut(ref.mouse));
      }
    }, [hovered]);
  }
  else {
    useNoResource();
  }

  if (onMouseDown || onMouseUp) {
    const { left, middle, right } = pressed;
    useResource((dispose) => {
      if (left) {
        if (onMouseDown) onMouseDown(ref.mouse);
        if (onMouseUp) dispose(() => onMouseUp(ref.mouse));
      }
    }, [left]);
    useResource((dispose) => {
      if (middle) {
        if (onMouseDown) onMouseDown(ref.mouse);
        if (onMouseUp) dispose(() => onMouseUp(ref.mouse));
      }
    }, [middle]);
    useResource((dispose) => {
      if (right) {
        if (onMouseDown) onMouseDown(ref.mouse);
        if (onMouseUp) dispose(() => onMouseUp(ref.mouse));
      }
    }, [right]);
  }
  else {
    useNoResource();
  }

  const count = presses.left + clicks.left + presses.middle + clicks.middle + presses.right + clicks.right;

  return useMemo(() =>
    render ? render({id, index, hovered, pressed, presses, clicks}) : (children ?? null),
    [render, children, id, index, hovered, pressed, count]
  );
};

