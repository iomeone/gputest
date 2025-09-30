import React from 'react';
import type { LC, LiveElement } from '../../live';

import { use, fragment, useState } from '../../live';
import { HTML } from '../../react';

const STYLE = {
  position: 'absolute',

  left: 0,
  //left: '50%',
  //marginLeft: '-100px',

  bottom: 0,
  width: '400px',
  padding: '20px',
  background: 'rgba(0, 0, 0, .75)',
};

type BHControlsProps = {
  container?: Element | null,
  children?: (options: BHOptions) => LiveElement
};

export type BHOptions = {
  exposure: number,
  seed: number,
  debug: boolean,
  red: number,
  green: number,
  blue: number,
};

export const BHControls: LC<BHControlsProps> = (props: BHControlsProps) => {
  const {container, children} = props;

  const [exposure, setExposure] = useState(2);

  const [seed, setSeed] = useState((Math.random() * 4096) >>> 0);
  const [debug, setDebug] = useState(false);

  const [red, setRed] = useState(0.7);
  const [green, setGreen] = useState(0.2);
  const [blue, setBlue] = useState(1.0);

  return fragment([
    children ? children({exposure, seed, red, green, blue, debug}) : null,
    use(HTML, {
      container,
      style: STYLE,
      children: (<>
        <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
          <div>
            <div style={{display: 'flex', alignItems: 'center', height: 30}}>
              <label style={{width: 120}}>Brightness &nbsp;&nbsp;</label>
              <input type="range" min="0.5" max="8" value={exposure} step={0.001} onChange={(e) => setExposure(parseFloat(e.target.value))} style={{width: '200px'}} />
            </div>
            <div style={{display: 'flex', alignItems: 'center', height: 30}}>
              <label style={{width: 120}}>Seed &nbsp;&nbsp;</label>
              <input type="range" min="1" max="4096" value={seed} step={1} onChange={(e) => setSeed(parseInt(e.target.value))} style={{width: '200px'}} />
            </div>
            <div style={{display: 'flex', alignItems: 'center', height: 30}}>
              <label style={{width: 120}}>Color R &nbsp;&nbsp;</label>
              <input type="range" min="0" max="1" value={red} step={0.001} onChange={(e) => setRed(parseFloat(e.target.value))} style={{width: '200px'}} />
            </div>
            <div style={{display: 'flex', alignItems: 'center', height: 30}}>
              <label style={{width: 120}}>Color G &nbsp;&nbsp;</label>
              <input type="range" min="0" max="1" value={green} step={0.001} onChange={(e) => setGreen(parseFloat(e.target.value))} style={{width: '200px'}} />
            </div>
            <div style={{display: 'flex', alignItems: 'center', height: 30}}>
              <label style={{width: 120}}>Color B &nbsp;&nbsp;</label>
              <input type="range" min="0" max="1" value={blue} step={0.001} onChange={(e) => setBlue(parseFloat(e.target.value))} style={{width: '200px'}} />
            </div>
          </div>
          <div><label><input type="checkbox" checked={debug} onChange={(e) => setDebug(e.target.checked)}  /> Show impostor</label></div>
        </div>
      </>)
    }),
  ]);
}
