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
  width: '250px',
  padding: '20px',
  background: 'rgba(0, 0, 0, .75)',
};

type SurfaceControlsProps = {
  hasInspect?: boolean,
  container?: Element | null,
  render?: ({inspect, mode, level}: {
    inspect: boolean,
    mode: string,
    level: number,
  }) => LiveElement
};

export const SurfaceControls: LC<SurfaceControlsProps> = (props: SurfaceControlsProps) => {
  const {hasInspect, container, render} = props;

  const [inspect, setInspect] = useState(false);
  const [mode, setMode] = useState('value');
  const [level, setLevel] = useState(0);

  return fragment([
    render ? render({inspect, mode, level}) : null,
    use(HTML, {
      container,
      style: STYLE,
      children: (<>
        {hasInspect ? (<>
          <div>
            <label><input type="checkbox" checked={inspect} onChange={(e) => setInspect(e.target.checked)} /> Show Field:</label>
            <select style={{marginLeft: 20}} onChange={(e) => setMode(e.target.value)}>
              <option value="value">Values</option>
              <option value="normal">Normals</option>
            </select>
          </div>
          <div style={{display: 'flex', alignItems: 'center', height: 30}}><label>Level&nbsp;&nbsp;</label><input type="range" min="-1.5" max="1.5" value={level} step={0.01} onChange={(e) => setLevel(parseFloat(e.target.value))} /></div>
        </>) : null}
      </>)
    }),
  ]);
}
