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

type PlotControlsProps = {
  hasNormalize?: boolean,
  container?: Element | null,
  render?: ({normalize}: {
    normalize: boolean,
  }) => LiveElement
};

export const PlotControls: LC<PlotControlsProps> = (props: PlotControlsProps) => {
  const {hasNormalize, container, render} = props;

  const [normalize, setNormalize] = useState(true);

  return fragment([
    render ? render({normalize}) : null,
    use(HTML, {
      container,
      style: STYLE,
      children: (<>
        {hasNormalize ? (
          <div>
            <label><input type="checkbox" checked={normalize} onChange={(e) => setNormalize(e.target.checked)} /> Normalize Transform</label>
          </div>
        ) : null}
      </>)
    }),
  ]);
}
