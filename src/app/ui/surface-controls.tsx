import React from 'react';
import type { LC, LiveElement } from '@use-gpu/live';
import type { ShaderSource } from '@use-gpu/shader';

import { use, fragment, useState } from '@use-gpu/live';
import { HTML } from '@use-gpu/react';
import { useRouterContext } from '@use-gpu/workbench';

import { ENVIRONMENTS } from './envmap-controls';

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
  render?: ({inspect, mode, level, roughness}: {
    inspect: boolean,
    mode: string,
    level: number,
    roughness: number,
    metalness: number,
    env: string,
    envMap: LiveElement,
  }) => LiveElement
};

export const SurfaceControls: LC<SurfaceControlsProps> = (props: SurfaceControlsProps) => {
  const {hasInspect, container, render} = props;

  const [inspect, setInspect] = useState(false);
  const [mode, setMode] = useState('value');
  const [level, setLevel] = useState(0);
  const [env, setEnv] = useState('park');

  const [roughness, setRoughness] = useState(0.5);
  const [metalness, setMetalness] = useState(0);

  const envMap = ENVIRONMENTS[env];
  const [approximate, setApproximate] = useState(false);

  return fragment([
    render ? render({inspect, mode, level, roughness, metalness, envMap: approximate ? null : envMap, env}) : null,
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
          <div style={{display: 'flex', alignItems: 'center', height: 30}}><label>Roughness&nbsp;&nbsp;</label><input type="range" min="0" max="1" value={roughness} step={0.01} onChange={(e) => setRoughness(parseFloat(e.target.value))} /></div>
          <div style={{display: 'flex', alignItems: 'center', height: 30}}><label>Metalness&nbsp;&nbsp;</label><input type="range" min="0" max="1" value={metalness} step={0.01} onChange={(e) => setMetalness(parseFloat(e.target.value))} /></div>
          <div style={{marginTop: 20}}>
            Environment Preset
            <select style={{marginLeft: 20}} onChange={(e) => setEnv(e.target.value)}>
              <option value="park">Park</option>
              <option value="pisa">Pisa</option>
              <option value="road">Road</option>
              <option value="field">Field</option>
            </select>
          </div>
          <div>
            <label><input type="checkbox" checked={approximate} onChange={(e) => setApproximate(e.target.checked)} /> Approximate SH</label>
          </div>
        </>) : null}
      </>)
    }),
  ]);
}
