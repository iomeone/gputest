import { LiveComponent, LiveElement } from '@use-gpu/live/types';
import { useContext, useMemo, useOne, useResource, useSomeResource, useNoResource } from '@use-gpu/live';
import { EventContext, MouseContext, MouseEventState } from '../providers/event-provider';

type PickState = {id: number, hovered: boolean, clicked: boolean, index: number};

export type PickProps = {
  render?: (state: PickState) => LiveElement<any>,
  children?: LiveElement<any>,
  onMouseEnter?: (m: MouseEventState) => void,
  onMouseLeave?: (m: MouseEventState) => void,
  onMouseDown?: (m: MouseEventState) => void,
  onMouseUp?: (m: MouseEventState) => void,
  onMouseMove?: (m: MouseEventState) => void,
}

export const Pick: LiveComponent<PickProps> = (fiber) => ({
  render,
  children,
  onMouseEnter,
  onMouseLeave,
  onMouseDown,
  onMouseUp,
  onMouseMove,
}) => {
  const { useId } = useContext(EventContext);
  const { useMouseState } = useContext(MouseContext);

  const id = useId();
  const mouseState = useMouseState(id);
  const { buttons, x, y, hovered, clicked, index } = mouseState;

  const ref = useOne(() => ({mouseState}));
  ref.mouseState = mouseState;

  if (onMouseMove) {
    useSomeResource(() => {
      if (onMouseMove) onMouseMove(ref.mouseState);
    }, [x, y]);
  }
  else {
    useNoResource();
  }

  useResource((dispose) => {
    if (hovered) {
      if (onMouseEnter) onMouseEnter(ref.mouseState);
      if (onMouseLeave) dispose(() => onMouseLeave(ref.mouseState));
    }
  }, [hovered]);

  useResource((dispose) => {
    if (clicked) {
      if (onMouseDown) onMouseDown(ref.mouseState);
      if (onMouseUp) dispose(() => onMouseUp(ref.mouseState));
    }
  }, [clicked, hovered]);

  return useMemo(() =>
    render ? render({id, hovered, clicked, index}) : (children ?? null),
    [render, children, id, hovered, clicked]
  );
};
