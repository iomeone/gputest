import React from 'react';
import type { LC, LiveElement } from '@use-gpu/live';

import { use, fragment, useState } from '@use-gpu/live';
import { HTML } from '@use-gpu/react';
import { useRouterContext } from '@use-gpu/workbench';

const STYLE = {
  position: 'absolute',

  left: 0,
  //left: '50%',
  //marginLeft: '-100px',

  bottom: 0,
  width: '200px',
  padding: '20px',
  background: 'rgba(0, 0, 0, .75)',
};

type CFDControlsProps = {
  hasInspect?: boolean,
  container?: Element | null,
  render?: ({inspect}: {
    inspect: boolean,
  }) => LiveElement
};

export const CFDControls: LC<CFDControlsProps> = (props: CFDControlsProps) => {
  const {hasInspect, container, render} = props;

  const [inspect, setInspect] = useState(true);

  return fragment([
    render ? render({inspect}) : null,
    use(HTML, {
      container,
      style: STYLE,
      children: (<>
        {hasInspect ? (
          <div>
            <label><input type="checkbox" checked={inspect} onChange={(e) => setInspect(e.target.checked)} /> Show Fields</label>
          </div>
        ) : null}
      </>)
    }),
  ]);
}
