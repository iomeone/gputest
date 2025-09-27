import type { LiveFiber } from '@use-gpu/live';

import React, { useState } from 'react';
import { usePingContext } from '../ping';

import { inspectObject } from './props';

type GeometryProps = {
  fiber: LiveFiber<any>,
};

export const Geometry: React.FC<GeometryProps> = ({fiber}) => {

  const render = fiber.__inspect?.render;
  if (!render) return null;

  usePingContext();

  const [state, setState] = useState<Record<string, boolean>>({});
  const toggleState = (id: string) => setState((state) => ({
    ...state,
    [id]: !state[id],
  }));

  return (<>
    <div><b>Counts</b></div>
    {inspectObject(render, state, toggleState, '')}
  </>);
}
