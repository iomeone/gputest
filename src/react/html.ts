import { LiveComponent } from '@use-gpu/live/types';
import { useFiber, useResource, useNoResource } from '@use-gpu/live';

import React from 'react';
import ReactDOM from 'react-dom';

export type HTMLProps = {
  container: HTMLElement,
  style: Record<string, any>,
  children: React.ReactNode,
};

export const HTML: LiveComponent<HTMLProps> = ({container, style, children}) => {
  const fiber = useFiber();

  // Create wrapper div
  const div = useResource((dispose) => {

    const div = document.createElement('div');
    container.appendChild(div);

    dispose(() => {
      ReactDOM.unmountComponentAtNode(container);
      container.removeChild(div);
    });

    return div;
  }, [container]);

  // Apply/unapply styles
  if (style) {
    useResource((dispose) => {
      for (let k in style!) div.style[k] = style[k];
      dispose(() => {
        for (let k in style!) div.style[k] = 'unset';
      });
    }, [div, style]);
  }
  else {
    useNoResource();
  }

  ReactDOM.render(children, div);

  const f = fiber as any;
  const i = f.__inspect = f.__inspect ?? {};
  const r = i.react = i.react ?? {root: null};
  r.root = (div as any)._reactRootContainer?._internalRoot;

  return null;
};
