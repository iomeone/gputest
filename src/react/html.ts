import { useFiber, useResource, useNoResource } from '@use-gpu/live';

import React from 'react';
import ReactDOM from 'react-dom';

export type HTMLProps = {
  container?: Element | null,
  style?: Record<string, any>,
  children?: JSX.Element,
};

// Show up in docs as LC
type LiveComponent<T> = (props: T) => null;

/**
 * Render HTML. Portal from Live to React.
 */
export const HTML: LiveComponent<HTMLProps> = ({
  container,
  style,
  children,
}: HTMLProps) => {
  const element = container ?? document.body;
  const fiber = useFiber();

  // Create wrapper div
  const div = useResource((dispose) => {

    const div = document.createElement('div');
    element.appendChild(div);

    dispose(() => {
      ReactDOM.unmountComponentAtNode(div);
      element.removeChild(div);
    });

    return div;
  }, [element]);

  // Apply/unapply styles
  if (style) {
    useResource((dispose) => {
      for (let k in style!) (div.style as any)[k] = style[k];
      dispose(() => {
        for (let k in style!) (div.style as any)[k] = 'unset';
      });
    }, [div, style]);
  }
  else {
    useNoResource();
  }

  if (children) {
    ReactDOM.render(children as any, div);
  }
  else {
    ReactDOM.render(React.createElement('div', {}, null), div);
  }

  // Make React fibers inspectable in Live
  const f = fiber as any;
  const i = f.__inspect = f.__inspect ?? {};
  const r = i.react = i.react ?? {root: null};
  r.root = (div as any)._reactRootContainer?._internalRoot;

  return null;
};
