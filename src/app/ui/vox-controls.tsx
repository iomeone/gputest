import React from 'react';
import type { LC, LiveElement } from '@use-gpu/live';

import { use, fragment, useState } from '@use-gpu/live';
import { HTML } from '@use-gpu/react';

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

type VoxControlsProps = {
  hasShowIterations?: boolean,
  container?: Element | null,
  render?: ({showIterations}: {
    showIterations: boolean,
  }) => LiveElement
};

export const VoxControls: LC<VoxControlsProps> = (props: VoxControlsProps) => {
  const {hasShowIterations, container, render} = props;

  const [showIterations, setShowIterations] = useState(false);

  return fragment([
    render ? render({showIterations}) : null,
    use(HTML, {
      container,
      style: STYLE,
      children: (<>
        {hasShowIterations ? (
          <div>
            <label><input type="checkbox" checked={showIterations} onChange={(e) => setShowIterations(e.target.checked)} /> Show Ray Iterations</label>
          </div>
        ) : null}
      </>)
    }),
  ]);
}
