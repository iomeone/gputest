import React, { useLayoutEffect, useMemo, useRef } from 'react';

import type { LiveFiber, LiveElement } from '@use-gpu/live';
import { render as renderLive, unmount as unmountLive, resolveRootNode } from '@use-gpu/live';

export type LiveProps = {
  /** Live child to render (must be 1) */
  children: LiveElement,
};

/**
 * Run bare Live fiber inside React. Portal from React to Live.
 */
export const Live: React.FunctionComponent<LiveProps> = ({children}) => {
  const fiber = useRef<LiveFiber<any>>();

  const rootNode = useMemo(() => resolveRootNode(children), [children]);

  useLayoutEffect(() => {
    fiber.current = renderLive(rootNode, fiber.current);
  }, [rootNode]);

  useLayoutEffect(() => {
    return () => {
      const {current: f} = fiber;
      if (f) {
        fiber.current = undefined;
        unmountLive(f);
      }
    };
  }, []);

  return null;
};
