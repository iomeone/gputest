import type { LiveFiber } from '@use-gpu/live';

import React, { ReactNode, useState } from 'react';
import { InspectObject } from '@use-gpu/inspect';

type GeometryProps = {
  fiber: LiveFiber<any>,
};

export const renderGeometry = (props: any) => <Geometry {...props} />;

export const Geometry: React.FC<GeometryProps> = ({fiber}) => {

  const render = fiber.__inspect?.render;
  if (!render) return null;

  const [state, setState] = useState<Record<string, boolean>>({});
  const toggleState = (id: string) => setState((state) => ({
    ...state,
    [id]: !state[id],
  }));

  return (<>
    <div><b>Counts</b></div>
    <InspectObject object={render} state={state} toggleState={toggleState} />
  </>);
}
