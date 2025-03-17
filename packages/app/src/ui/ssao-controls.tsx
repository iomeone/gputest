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
  width: '420px',
  padding: '20px',
  background: 'rgba(0, 0, 0, .75)',
};

type SSAOControlsProps = {
  container?: Element | null,
  render?: ({showAO}: {
    showAO: boolean,
  }) => LiveElement
};

export const SSAOControls: LC<SSAOControlsProps> = (props: SSAOControlsProps) => {
  const {container, render} = props;

  const [showAO, setShowAO] = useState(false);

  return fragment([
    render ? render({showAO}) : null,
    use(HTML, {
      container,
      style: STYLE,
      children: (<>
        <div>
          <label><input type="checkbox" checked={showAO} onChange={(e) => setShowAO(e.target.checked)} /> Show Ambient Occlusion Samples</label>
          
          <div style={{paddingTop: 20}}>Hold [ALT] to visualize occlusion rays for the selected pixel</div>
        </div>
      </>)
    }),
  ]);
}
