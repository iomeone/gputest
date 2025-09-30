import { useFiber, useResource, useNoResource } from '@use-gpu/live';

import React from 'react';
import {createRoot} from 'react-dom/client';

export type HTMLProps = {
  container?: Element | null,
  style?: Record<string, any>,
  inspectable?: boolean,
  children?: JSX.Element,
};

// Show up in docs as LC, though technically `children` is wrong
type LC<T> = (props: T) => null;

/**
 * Render HTML. Portal from Live to React.
 */
export const HTML: LC<HTMLProps> = ({
  container,
  style,
  inspectable,
  children,
}: HTMLProps) => {
  const element = container ?? document.body;
  const fiber = useFiber();

  // Create wrapper div + react root
  const [div, root] = useResource((dispose) => {

    const div = document.createElement('div');
    element.appendChild(div);

    const root = createRoot(div);

    dispose(() => {
      setTimeout(() => {
        root.unmount();
        element.removeChild(div);
      });
    });

    return [div, root];
  }, [element]);

  // Apply/unapply styles
  if (style) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useResource((dispose) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      for (const k in style!) (div.style as any)[k] = style[k];
      dispose(() => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        for (const k in style!) (div.style as any)[k] = 'unset';
      });
    }, [div, style]);
  }
  else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useNoResource();
  }

  if (children) {
    root.render(children as any);
  }
  else {
    root.render(React.createElement('div', {}, null));
  }

  // Make React fibers inspectable in Live
  const f = fiber as any;
  const i = f.__inspect = f.__inspect ?? {};
  const r = i.react = i.react ?? {root: null};
  if (inspectable !== false) {
    r.root = (root as any)._internalRoot;
  }

  return null;
};
