import React, { useLayoutEffect, useRef } from 'react';

import type { LiveFiber, LiveElement } from '@use-gpu/live';
import { render as renderLive, unmount as unmountLive, resolveRootNode } from '@use-gpu/live';

export type LiveDivProps = {
  /** CSS styles to apply to the `<div>` */
  style?: Record<string, any>,
  /** Render prop for Live contents */
  render?: (div: HTMLDivElement) => LiveElement,
  /** Render prop for Live contents (alternative) */
  children?: (div: HTMLDivElement) => LiveElement,
};

/**
 * Embed Live `<div>` inside React. Portal from React to Live.
 */
export const LiveDiv: React.FunctionComponent<LiveDivProps> = ({style, render, children}) => {
  const el = useRef<HTMLDivElement>(null);
  const fiber = useRef<LiveFiber<any>>();

  useLayoutEffect(() => {
    if (el.current) {
      const content = (render ?? children);
      if (!content) {
        const {current: f} = fiber;
        if (f) {
          fiber.current = undefined;
          unmountLive(f);
        }
        return;
      }

      const element = (typeof content === 'function') ? content(el.current) : content;
      const rootNode = resolveRootNode(element);
      fiber.current = renderLive(rootNode, fiber.current);
    }
  });

  useLayoutEffect(() => {
    return () => {
      const {current: f} = fiber;
      if (f) {
        fiber.current = undefined;
        unmountLive(f);
      }
    };
  }, []);

  return <div ref={el} style={style} />;
};
