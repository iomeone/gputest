import { LiveFiber, LiveComponent, LiveElement } from '@use-gpu/live/types';

import { memo, consume, makeContext, useConsumer, useOne, useMemo, getTailValue } from '@use-gpu/live';

export const CursorContext = makeContext(null, 'CursorContext');

export type CursorProps = {
  cursor?: string,
};

export type CursorConsumerProps = {
  element: HTMLElement,
  children: LiveElement<any>,
};

export const CursorConsumer: LiveComponent<CursorConsumerProps> = (fiber) => (props) => {
  const {element, children} = props;
  
  const Done = useOne(() => {
    const Done = () => (registry: Map<LiveFiber<any>, string>) => {
      const cursor = getTailValue(registry) ?? 'default';
      if (element.style.cursor !== cursor) element.style.cursor = cursor;
    };
    Done.displayName = '[Cursor]';
    // @ts-ignore
    Done.isStaticComponent = true;
    return Done;
  }, element);
  
  return consume(CursorContext, children, Done);
};

export const Cursor: LiveComponent<CursorProps> = memo((fiber) => (props) => {
  useConsumer(CursorContext, props.cursor);
  return null;
}, 'Cursor');
