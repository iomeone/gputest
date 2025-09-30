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
  width: '350px',
  padding: '20px',
  background: 'rgba(0, 0, 0, .75)',
};

type HypersphereControlsProps = {
  container?: Element | null,
  render?: (options: HypersphereOptions) => LiveElement
};

export type HypersphereOptions = {
  bend: number,
  spin: number,
  animate: boolean,
  full: boolean,
  showX: boolean,
  showY: boolean,
  showZ: boolean,
};

export const HypersphereControls: LC<HypersphereControlsProps> = (props: HypersphereControlsProps) => {
  const {container, render} = props;

  const [bend, setBend] = useState(1);
  const [spin, setSpin] = useState(0);
  const [full, setFull] = useState(false);

  const [animate, setAnimate] = useState(true);
  const [showX, setShowX] = useState(true);
  const [showY, setShowY] = useState(true);
  const [showZ, setShowZ] = useState(true);

  return fragment([
    render ? render({bend, spin, animate, full, showX, showY, showZ}) : null,
    use(HTML, {
      container,
      style: STYLE,
      children: (<>
        <div>
          <div style={{display: 'flex', alignItems: 'center', height: 30}}>
            <label>Cartesian &nbsp;&nbsp;</label>
            <input type="range" min="0" max="1" value={bend} step={0.0001} onChange={(e) => setBend(parseFloat(e.target.value))} />
            <label>&nbsp;&nbsp; Stereographic</label>
          </div>
          <div style={{display: 'flex', alignItems: 'center', height: 30}}>
            <label>4D Rotation &nbsp;&nbsp;</label>
            <input type="range" min="0" max="6.28" value={spin} step={0.0001} onChange={(e) => setSpin(parseFloat(e.target.value))} style={{width: '200px'}} />
          </div>
          <div><label><input type="checkbox" checked={animate} onChange={(e) => setAnimate(e.target.checked)}  /> Auto-rotate</label></div>
          <div><label><input type="checkbox" checked={full}    onChange={(e) => setFull(e.target.checked)}  /> Show negative half-space</label></div>
          <div><label><input type="checkbox" checked={showX}   onChange={(e) => setShowX(e.target.checked)} /> Show X geodesics</label></div>
          <div><label><input type="checkbox" checked={showY}   onChange={(e) => setShowY(e.target.checked)} /> Show Y geodesics</label></div>
          <div><label><input type="checkbox" checked={showZ}   onChange={(e) => setShowZ(e.target.checked)} /> Show Z geodesics</label></div>
        </div>
      </>)
    }),
  ]);
}
