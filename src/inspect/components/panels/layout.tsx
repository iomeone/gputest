import type { LiveFiber } from '@use-gpu/live';

import React, { useState } from 'react';
import { DOMMock, SplitRow, Label, Spacer } from '../layout';

import { InspectObject } from '../inspect-object';

type LayoutProps = {
  fiber: LiveFiber<any>,
};

export const Layout: React.FC<LayoutProps> = ({fiber}) => {

  const layout = fiber.__inspect?.layout;
  if (!layout) return null;

  const {into, size, sizes, offsets, self} = layout;
  let n = sizes.length;
  
  const SCALE = 1/2;

  const width  = Math.max(size[0], into[0] || 0);
  const height = Math.max(size[1], into[1] || 0);
  
  const [state, setState] = useState<Record<string, boolean>>({});
  const toggleState = (id: string) => setState((state) => ({
    ...state,
    [id]: !state[id],
  }));

  return (<>
    <div><b>Props</b></div>
    <InspectObject object={layout} state={state} toggleState={toggleState} />
    <Spacer />
    <div style={{position: 'relative', width: width * SCALE, height: height * SCALE}}>
      <DOMMock style={{
        width: size[0] * SCALE,
        height: size[1] * SCALE,
        left: (self?.[0] || 0) * SCALE,
        top: (self?.[1] || 0) * SCALE,
      }} />
      <DOMMock style={{
        width: (into[0] || 0) * SCALE,
        height: (into[1] || 0) * SCALE,
        borderStyle: 'dashed'}
      } />
      {
        sizes.map((size: [number, number], i: number) =>
          <DOMMock key={i.toString()} style={{
            position: 'absolute',
            left: offsets[i][0] * SCALE,
            top: offsets[i][1] * SCALE,
            width: size[0] * SCALE,
            height: size[1] * SCALE,
          }} />
        )
      }
    </div>
  </>);
}
