import React, { useLayoutEffect, useRef } from 'react';

import type { LiveFiber, LiveElement } from '@use-gpu/live';
import { render as renderLive, unmount as unmountLive, resolveRootNode } from '@use-gpu/live';

export type LiveCanvasProps = {
  /** CSS styles to apply to the `<canvas>` */
  style?: Record<string, any>,
  /** Render prop for Live contents */
  render?: (canvas: HTMLCanvasElement) => LiveElement,
  /** Render prop for Live contents (alternative) */
  children?: (canvas: HTMLCanvasElement) => LiveElement,
};

/**
 * Embed Live `<canvas>` inside React. Portal from React to Live.
 */
export const LiveCanvas: React.FunctionComponent<LiveCanvasProps> = ({style, render, children}) => {
  const el = useRef<HTMLCanvasElement>(null);
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

  return <canvas ref={el} style={style} />;
};
