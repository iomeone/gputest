import type { LiveFiber, LiveComponent, LiveElement } from '@use-gpu/live';
import { fragment, use, useOne, useState } from '@use-gpu/live';
import { HTML } from '@use-gpu/react';

import React from 'react';
import { Inspect } from './components/inspect';

export type UseInspectProps = {
  fiber: LiveFiber<any>,
  active?: boolean,
  provider: LiveComponent<any>,
  container: Element,
};

const STYLE = {
  position: 'absolute',
  inset: '0',
  pointerEvents: 'none',
  zIndex: 10000,
};

export const UseInspect: LiveComponent<UseInspectProps> = ({
  fiber,
  provider,
  container,
  children,
  active = true,
}) => {
  if (!fiber) throw new Error("<UseInspect> Must supply fiber to inspect");

  const [layout, setLayout] = useState<boolean>(false);
  const handleInspect = () => setLayout(l => !l);

  const debug = useOne(() => ({layout: {inspect: layout}}), layout);

  return fragment([
    provider ? use(provider, {debug, children}) : children,
    active ? use(HTML, {
      container,
      style: STYLE,
      children: <Inspect fiber={fiber} onInspect={handleInspect} />,
    }) : null
  ]);
}
