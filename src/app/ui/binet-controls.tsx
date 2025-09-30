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

type BinetControlsProps = {
  container?: Element | null,
  render?: (options: BinetOptions) => LiveElement
};

export type BinetOptions = {
  spin1: number,
  spin2: number,
  surface: boolean,
  posX: number,
  posY: number,
};

export const BinetControls: LC<BinetControlsProps> = (props: BinetControlsProps) => {
  const {container, render} = props;

  const [spin1, setSpin1] = useState(-1.5707963268/4);
  const [spin2, setSpin2] = useState(-1.5707963268);

  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(1);

  const [surface, setSurface] = useState(true);

  return fragment([
    render ? render({spin1, spin2, surface, posX, posY}) : null,
    use(HTML, {
      container,
      style: STYLE,
      children: (<>
        <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
          <div>
            <div style={{display: 'flex', alignItems: 'center', height: 30}}>
              <label style={{width: 120}}>W Angle &nbsp;&nbsp;</label>
              <input type="range" min="-1.5707963268" max="1.5707963268" value={spin1} step={0.0001} onChange={(e) => setSpin1(parseFloat(e.target.value))} style={{width: '200px'}} />
            </div>
            <div style={{display: 'flex', alignItems: 'center', height: 30}}>
              <label style={{width: 120}}>YZ Angle &nbsp;&nbsp;</label>
              <input type="range" min="-1.5707963268" max="1.5707963268" value={spin2} step={0.0001} onChange={(e) => setSpin2(parseFloat(e.target.value))} style={{width: '200px'}} />
            </div>
            <div style={{display: 'flex', alignItems: 'center', height: 30}}>
              <label style={{width: 120}}>Trim Domain X &nbsp;&nbsp;</label>
              <input type="range" min="-5" max="5" value={posX} step={0.0001} onChange={(e) => setPosX(parseFloat(e.target.value))} style={{width: '200px'}} />
            </div>
            <div style={{display: 'flex', alignItems: 'center', height: 30}}>
              <label style={{width: 120}}>Trim Domain Y &nbsp;&nbsp;</label>
              <input type="range" min="-2" max="2" value={posY} step={0.0001} onChange={(e) => setPosY(parseFloat(e.target.value))} style={{width: '200px'}} />
            </div>
          </div>
          <div><label><input type="checkbox" checked={surface} onChange={(e) => setSurface(e.target.checked)}  /> Show surface</label></div>
        </div>
      </>)
    }),
  ]);
}
