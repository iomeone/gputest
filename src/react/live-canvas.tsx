import React, { useLayoutEffect, useRef } from 'react';

import type { LiveFiber, LiveElement } from '@use-gpu/live';
import { render as renderLive, resolveRootNode } from '@use-gpu/live';

export type LiveCanvasProps = {
  /** CSS styles to apply to the `<canvas>` */
  style?: Record<string, any>,
  /** Render prop for Live contents */
  render?: (canvas: HTMLCanvasElement) => LiveElement<any>,
  /** Render prop for Live contents (alternative) */
  children?: (canvas: HTMLCanvasElement) => LiveElement<any>,
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
      if (!content) return;
      
      const element = (typeof content === 'function') ? content(el.current) : content;
      const rootNode = resolveRootNode(element);
      fiber.current = renderLive(rootNode, fiber.current);
    }
  }, [render]);

  return <canvas ref={el} style={style} />;
};
