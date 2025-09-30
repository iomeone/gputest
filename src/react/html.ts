import { useFiber, useResource, useState, useNoResource } from '@use-gpu/live';

import React from 'react';
import {createRoot} from 'react-dom/client';

const OUTLINE_COLOR = 'rgba(76, 229, 255, 1)';

const OUTLINE_STYLE = `2px solid ${OUTLINE_COLOR}`;
const BOX_SHADOW_STYLE = `inset 0 0 0 2px ${OUTLINE_COLOR}`;

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

  const inspect = fiber.__inspect = fiber.__inspect || {};

  const [hovered, setHovered] = useState<boolean>(false);
  if (!inspect.setHovered) {
    fiber.__inspect.setHovered = setHovered;
  }

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

  useResource((dispose) => {
    if (!hovered) return;

    const outlineStyle = div.style?.outline;
    const boxShadowStyle = div.style?.boxShadow;

    div.style?.setProperty('outline', OUTLINE_STYLE);
    div.style?.setProperty('box-shadow', BOX_SHADOW_STYLE);

    dispose(() => {
      div.style?.setProperty('outline', outlineStyle);
      div.style?.setProperty('box-shadow', boxShadowStyle);
    });
  }, [hovered]);

  // Apply/unapply styles
  if (style) {
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
